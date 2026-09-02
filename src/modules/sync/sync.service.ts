import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async push(terminalId: string, records: Array<{
    operation: string;
    tableName: string;
    recordId: string;
    payload: any;
  }>) {
    const results = [];

    for (const record of records) {
      try {
        // Check for existing sync entry
        const existing = await this.prisma.syncQueue.findFirst({
          where: {
            terminalId,
            tableName: record.tableName,
            recordId: record.recordId,
            status: { in: ['PENDING', 'FAILED'] },
          },
        });

        if (existing) {
          // Update existing entry
          await this.prisma.syncQueue.update({
            where: { id: existing.id },
            data: {
              payload: record.payload,
              retryCount: { increment: 1 },
            },
          });
          results.push({ recordId: record.recordId, status: 'updated' });
        } else {
          // Create new entry
          await this.prisma.syncQueue.create({
            data: {
              terminalId,
              operation: record.operation,
              tableName: record.tableName,
              recordId: record.recordId,
              payload: record.payload,
              status: 'PENDING',
            },
          });
          results.push({ recordId: record.recordId, status: 'queued' });
        }
      } catch (error) {
        this.logger.error(`Failed to queue record ${record.recordId}: ${error.message}`);
        results.push({ recordId: record.recordId, status: 'error', error: error.message });
      }
    }

    // Log sync attempt
    await this.prisma.syncLog.create({
      data: {
        terminalId,
        direction: 'PUSH',
        status: 'SUCCESS',
        recordsCount: records.length,
      },
    });

    return { queued: results.length, results };
  }

  async pull(terminalId: string, lastSyncVersion?: number) {
    const version = lastSyncVersion || 0;

    // Pull master data that has changed since last sync
    const [products, categories, brands, promotions, settings] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          brand: true,
          variants: { where: { isActive: true } },
        },
      }),
      this.prisma.category.findMany({ where: { parentId: null } }),
      this.prisma.brand.findMany(),
      this.prisma.promotion.findMany({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
      this.prisma.systemSetting.findMany(),
    ]);

    // Update terminal sync config
    await this.prisma.terminalConfig.upsert({
      where: { terminalId },
      update: { lastSyncAt: new Date(), syncVersion: { increment: 1 } },
      create: { terminalId, lastSyncAt: new Date(), syncVersion: 1 },
    });

    return {
      products,
      categories,
      brands,
      promotions,
      settings: settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
      syncVersion: version + 1,
    };
  }

  async processPending(terminalId: string) {
    const pending = await this.prisma.syncQueue.findMany({
      where: { terminalId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    const results = [];

    for (const record of pending) {
      try {
        // Apply the operation based on table name and operation type
        await this.applyRecord(record);
        
        await this.prisma.syncQueue.update({
          where: { id: record.id },
          data: { status: 'SYNCED', syncedAt: new Date() },
        });

        results.push({ id: record.id, status: 'synced' });
      } catch (error) {
        this.logger.error(`Failed to sync record ${record.id}: ${error.message}`);
        
        await this.prisma.syncQueue.update({
          where: { id: record.id },
          data: {
            status: record.retryCount >= 3 ? 'FAILED' : 'PENDING',
            retryCount: { increment: 1 },
            lastError: error.message,
          },
        });

        results.push({ id: record.id, status: 'failed', error: error.message });
      }
    }

    return { processed: results.length, results };
  }

  private async applyRecord(record: any) {
    const { tableName, operation, payload } = record;

    // This is where you'd implement the actual data sync logic
    // For now, we'll just log it
    this.logger.log(`Applying ${operation} on ${tableName}: ${record.recordId}`);
  }

  async getSyncStatus(terminalId: string) {
    const config = await this.prisma.terminalConfig.findUnique({
      where: { terminalId },
    });

    const pendingCount = await this.prisma.syncQueue.count({
      where: { terminalId, status: 'PENDING' },
    });

    const failedCount = await this.prisma.syncQueue.count({
      where: { terminalId, status: 'FAILED' },
    });

    const recentLogs = await this.prisma.syncLog.findMany({
      where: { terminalId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      lastSyncAt: config?.lastSyncAt,
      syncVersion: config?.syncVersion || 0,
      offlineMode: config?.offlineMode || false,
      pendingCount,
      failedCount,
      recentLogs,
    };
  }

  async setOfflineMode(terminalId: string, offline: boolean) {
    return this.prisma.terminalConfig.upsert({
      where: { terminalId },
      update: { offlineMode: offline },
      create: { terminalId, offlineMode: offline },
    });
  }
}
