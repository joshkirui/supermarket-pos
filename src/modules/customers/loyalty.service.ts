import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(private prisma: PrismaService) {}

  async earnPoints(customerId: string, saleId: string, amount: number) {
    // Get loyalty config
    const pointsPerKes = await this.getSetting('loyalty.points_per_kes', 1);
    const points = Math.floor(amount * pointsPerKes);

    if (points <= 0) return null;

    // Create loyalty transaction
    const transaction = await this.prisma.loyaltyTransaction.create({
      data: {
        customerId,
        saleId,
        points,
        type: 'EARN',
        description: `Earned ${points} points from sale`,
      },
    });

    // Update customer points
    await this.prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { increment: points } },
    });

    // Check tier upgrade
    await this.checkTierUpgrade(customerId);

    return { transaction, pointsEarned: points };
  }

  async redeemPoints(customerId: string, saleId: string, points: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || customer.loyaltyPoints < points) {
      throw new Error('Insufficient loyalty points');
    }

    const transaction = await this.prisma.loyaltyTransaction.create({
      data: {
        customerId,
        saleId,
        points: -points,
        type: 'REDEEM',
        description: `Redeemed ${points} points`,
      },
    });

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { decrement: points } },
    });

    await this.checkTierUpgrade(customerId);

    return { transaction, pointsRedeemed: points };
  }

  async getBalance(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { loyaltyPoints: true, tier: true, totalSpent: true },
    });

    return customer;
  }

  async getTransactionHistory(customerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({ where: { customerId } }),
    ]);

    return { data: transactions, meta: { total, page, limit } };
  }

  private async checkTierUpgrade(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) return;

    const silverThreshold = await this.getSetting('loyalty.silver_threshold', 10000);
    const goldThreshold = await this.getSetting('loyalty.gold_threshold', 50000);

    let newTier = 'BRONZE';
    if (Number(customer.totalSpent) >= goldThreshold) {
      newTier = 'GOLD';
    } else if (Number(customer.totalSpent) >= silverThreshold) {
      newTier = 'SILVER';
    }

    if (customer.tier !== newTier) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { tier: newTier as any },
      });
      this.logger.log(`Customer ${customerId} tier upgraded to ${newTier}`);
    }
  }

  private async getSetting(key: string, defaultValue: any): Promise<any> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value ?? defaultValue;
  }

  async calculatePointsEarned(amount: number): Promise<number> {
    const pointsPerKes = await this.getSetting('loyalty.points_per_kes', 1);
    return Math.floor(amount * pointsPerKes);
  }
}
