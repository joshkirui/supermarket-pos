import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateRefundDto } from './dto/refund.dto';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRefundDto, userId: string) {
    const originalSale = await this.prisma.sale.findUnique({
      where: { id: dto.originalSaleId },
      include: { items: true },
    });

    if (!originalSale) throw new NotFoundException('Original sale not found');

    if (dto.idempotencyKey) {
      const existing = await this.prisma.refund.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    // Validate refund quantities don't exceed original sale quantities
    for (const item of dto.items) {
      const originalItem = originalSale.items.find((i) => i.id === item.saleItemId);
      if (!originalItem) {
        throw new BadRequestException(`Sale item ${item.saleItemId} not found in original sale`);
      }

      if (item.quantityReturned > Number(originalItem.quantity)) {
        throw new BadRequestException(
          `Refund quantity ${item.quantityReturned} exceeds original quantity ${originalItem.quantity}`,
        );
      }
    }

    const refundAmount = dto.items.reduce(
      (sum, item) => sum + item.unitRefundAmount * item.quantityReturned,
      0,
    );

    // Find a cashier role user different from the one who made the sale (segregation of duties)
    // For now, auto-approve if manager is refunding their own store
    const saleCashierId = originalSale.cashSessionId
      ? (await this.prisma.cashSession.findUnique({
          where: { id: originalSale.cashSessionId },
        }))?.cashierId
      : null;

    const canSelfApprove = saleCashierId !== userId;

    return this.prisma.$transaction(async (tx) => {
      // Create the refund
      const refund = await tx.refund.create({
        data: {
          saleId: dto.originalSaleId,
          originalSaleId: dto.originalSaleId,
          reason: dto.reason,
          refundAmount,
          approvedById: canSelfApprove ? userId : null,
          status: canSelfApprove ? 'APPROVED' : 'PENDING',
          idempotencyKey: dto.idempotencyKey,
          items: {
            create: dto.items.map((item) => ({
              saleItemId: item.saleItemId,
              quantityReturned: item.quantityReturned,
              unitRefundAmount: item.unitRefundAmount,
              refundTotal: item.unitRefundAmount * item.quantityReturned,
            })),
          },
        },
        include: { items: true },
      });

      // If approved, reverse stock
      if (canSelfApprove) {
        for (const item of dto.items) {
          const originalItem = originalSale.items.find((i) => i.id === item.saleItemId);
          if (!originalItem) continue;

          const variant = await tx.productVariant.findUnique({
            where: { id: originalItem.variantId },
          });

          if (!variant) continue;

          const oldBalance = variant.stockQuantity;
          const newBalance = oldBalance + item.quantityReturned;

          await tx.productVariant.update({
            where: { id: originalItem.variantId },
            data: { stockQuantity: newBalance },
          });

          await tx.stockMovement.create({
            data: {
              variantId: originalItem.variantId,
              type: 'RETURN',
              quantityChange: item.quantityReturned,
              balanceBefore: oldBalance,
              balanceAfter: newBalance,
              referenceType: 'Refund',
              referenceId: refund.id,
            },
          });
        }

        // Update original sale status
        await tx.sale.update({
          where: { id: dto.originalSaleId },
          data: { paymentStatus: 'REFUNDED' },
        });
      }

      return refund;
    });
  }

  async approve(id: string, approverId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        items: { include: { saleItem: true } },
        original: true,
      },
    });

    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'PENDING') {
      throw new BadRequestException(`Refund is already ${refund.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Reverse stock for each item
      for (const item of refund.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.saleItem.variantId },
        });

        if (!variant) continue;

        const oldBalance = variant.stockQuantity;
        const newBalance = oldBalance + Number(item.quantityReturned);

        await tx.productVariant.update({
          where: { id: item.saleItem.variantId },
          data: { stockQuantity: newBalance },
        });

        await tx.stockMovement.create({
          data: {
            variantId: item.saleItem.variantId,
            type: 'RETURN',
            quantityChange: Number(item.quantityReturned),
            balanceBefore: oldBalance,
            balanceAfter: newBalance,
            referenceType: 'Refund',
            referenceId: id,
          },
        });
      }

      // Update refund status
      await tx.refund.update({
        where: { id },
        data: { status: 'APPROVED', approvedById: approverId },
      });

      // Update original sale
      await tx.sale.update({
        where: { id: refund.originalSaleId },
        data: { paymentStatus: 'REFUNDED' },
      });

      return { success: true, message: 'Refund approved and stock reversed' };
    });
  }

  async reject(id: string) {
    const refund = await this.prisma.refund.findUnique({ where: { id } });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'PENDING') {
      throw new BadRequestException(`Refund is already ${refund.status}`);
    }

    return this.prisma.refund.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async findAll(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: {
          original: { select: { saleNumber: true, totalAmount: true } },
          approver: { select: { fullName: true } },
          items: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ]);

    return { data: refunds, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
