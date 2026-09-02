import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreatePurchaseOrderDto, ReceivePoDto } from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Purchase order must have at least one item');
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.purchaseOrder.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    let totalAmount = new Prisma.Decimal(0);

    const itemsData = dto.items.map((item) => {
      const lineTotal = new Prisma.Decimal(item.unitCost).mul(item.quantityOrdered);
      totalAmount = totalAmount.add(lineTotal);
      return {
        variantId: item.variantId,
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        lineTotal,
      };
    });

    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: dto.supplierId,
        branchId: dto.branchId,
        totalAmount,
        expectedDelivery: dto.expectedDelivery ? new Date(dto.expectedDelivery) : null,
        idempotencyKey: dto.idempotencyKey,
        items: { create: itemsData },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        supplier: true,
      },
    });
  }

  async findAll(branchId?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    const [pos, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, items: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data: pos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        supplier: true,
        branch: true,
      },
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async receive(id: string, dto: ReceivePoDto) {
    const po = await this.findById(id);

    if (po.status === 'RECEIVED' || po.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot receive stock for PO in ${po.status} status`);
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        const poItem = po.items.find((i) => i.variantId === item.variantId);
        if (!poItem) continue;

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) continue;

        const oldBalance = variant.stockQuantity;
        const newBalance = oldBalance + item.quantityReceived;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: newBalance },
        });

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'PURCHASE',
            quantityChange: item.quantityReceived,
            balanceBefore: oldBalance,
            balanceAfter: newBalance,
            referenceType: 'PurchaseOrder',
            referenceId: id,
          },
        });

        await tx.poItem.update({
          where: { id: poItem.id },
          data: { quantityReceived: item.quantityReceived },
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' },
        include: { items: true },
      });
    });
  }

  async cancel(id: string) {
    const po = await this.findById(id);

    if (po.status === 'RECEIVED') {
      throw new BadRequestException('Cannot cancel a received PO');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
