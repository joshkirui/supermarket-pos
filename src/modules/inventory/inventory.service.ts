import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getStockLevels(variantId?: string, branchId?: string) {
    const where: any = { isActive: true };
    if (variantId) where.id = variantId;

    return this.prisma.productVariant.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
      },
    });
  }

  async getLowStock(branchId?: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: true },
    });

    return variants.filter((v) => v.stockQuantity <= v.reorderLevel);
  }

  async adjust(data: {
    variantId: string;
    quantityChange: number;
    reason: string;
    userId: string;
  }) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant) throw new NotFoundException('Variant not found');

    const oldBalance = variant.stockQuantity;
    const newBalance = oldBalance + data.quantityChange;

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient stock for adjustment');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: newBalance },
      });

      return tx.stockMovement.create({
        data: {
          variantId: data.variantId,
          type: 'ADJUSTMENT',
          quantityChange: data.quantityChange,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          referenceType: 'ManualAdjustment',
        },
      });
    });
  }

  async transfer(data: {
    variantId: string;
    quantity: number;
    fromBranchId: string;
    toBranchId: string;
    userId: string;
  }) {
    if (data.fromBranchId === data.toBranchId) {
      throw new BadRequestException('Cannot transfer to the same branch');
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant) throw new NotFoundException('Variant not found');

    if (variant.stockQuantity < data.quantity) {
      throw new BadRequestException('Insufficient stock for transfer');
    }

    const oldBalance = variant.stockQuantity;
    const newBalance = oldBalance - data.quantity;

    return this.prisma.$transaction(async (tx) => {
      // Deduct from source
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: newBalance },
      });

      // Record movement
      await tx.stockMovement.create({
        data: {
          variantId: data.variantId,
          type: 'TRANSFER',
          quantityChange: -data.quantity,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          referenceType: 'BranchTransfer',
          referenceId: data.toBranchId,
        },
      });

      return { success: true, message: `Transferred ${data.quantity} units` };
    });
  }

  async recordDamage(data: {
    variantId: string;
    quantity: number;
    reason: string;
    userId: string;
  }) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: data.variantId },
    });

    if (!variant) throw new NotFoundException('Variant not found');

    if (variant.stockQuantity < data.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const oldBalance = variant.stockQuantity;
    const newBalance = oldBalance - data.quantity;

    return this.prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: newBalance },
      });

      return tx.stockMovement.create({
        data: {
          variantId: data.variantId,
          type: 'DAMAGE',
          quantityChange: -data.quantity,
          balanceBefore: oldBalance,
          balanceAfter: newBalance,
          referenceType: 'DamageReport',
        },
      });
    });
  }

  async getStockMovementHistory(variantId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { variantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where: { variantId } }),
    ]);

    return {
      data: movements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
