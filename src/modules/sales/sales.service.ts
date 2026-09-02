import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateSaleDto, SaleQueryDto } from './dto/sale.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSaleDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.sale.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      throw new BadRequestException('One or more product variants not found');
    }

    for (const item of dto.items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) continue;

      if (variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${variant.product.name}": requested ${item.quantity}, available ${variant.stockQuantity}`,
        );
      }
    }

    const saleNumber = `SLN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const saleItemsData = dto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      const discount = new Prisma.Decimal(item.discountAmount || 0);
      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const quantity = new Prisma.Decimal(item.quantity);
      const lineTotal = unitPrice.mul(quantity).sub(discount);
      const taxAmount = lineTotal.mul(variant.product.taxRate).div(100);

      subtotal = subtotal.add(lineTotal);
      totalTax = totalTax.add(taxAmount);

      return {
        variantId: item.variantId,
        quantity,
        unitPrice,
        discountAmount: discount,
        lineTotal,
      };
    });

    const totalAmount = subtotal.add(totalTax);

    const result = await this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          terminalId: dto.terminalId,
          customerId: dto.customerId,
          cashSessionId: dto.cashSessionId,
          saleNumber,
          subtotal,
          taxAmount: totalTax,
          totalAmount,
          paymentStatus: 'UNPAID',
          saleType: 'SALE',
          idempotencyKey: dto.idempotencyKey,
          items: { create: saleItemsData },
        },
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
      });

      for (const item of dto.items) {
        const variant = variants.find((v) => v.id === item.variantId)!;
        const oldBalance = variant.stockQuantity;
        const newBalance = oldBalance - item.quantity;

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'SALE',
            quantityChange: new Prisma.Decimal(-item.quantity),
            balanceBefore: oldBalance,
            balanceAfter: newBalance,
            referenceType: 'Sale',
            referenceId: sale.id,
          },
        });
      }

      return sale;
    });

    return result;
  }

  async findAll(query: SaleQueryDto, userBranchId?: string) {
    const { date, cashierId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.createdAt = { gte: start, lt: end };
    }

    if (cashierId) {
      where.cashSession = { cashierId };
    }

    if (status) {
      where.paymentStatus = status;
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
          payments: true,
          customer: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
        payments: { include: { method: true } },
        customer: true,
        terminal: true,
      },
    });

    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async getDailySummary(date: string, branchId?: string) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const where: any = {
      createdAt: { gte: start, lt: end },
      paymentStatus: 'SUCCESS',
    };

    if (branchId) {
      where.terminal = { branchId };
    }

    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        subtotal: true,
        taxAmount: true,
        totalAmount: true,
      },
    });

    const totalRevenue = sales.reduce(
      (sum, s) => sum + Number(s.totalAmount),
      0,
    );
    const totalTax = sales.reduce((sum, s) => sum + Number(s.taxAmount), 0);
    const totalSales = sales.length;

    return {
      date,
      totalSales,
      totalRevenue,
      totalTax,
      netRevenue: totalRevenue - totalTax,
    };
  }
}
