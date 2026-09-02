import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async getDailySummary(date: string, branchId?: string) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const where: any = {
      createdAt: { gte: start, lt: end },
      paymentStatus: 'SUCCESS',
    };

    if (branchId) where.terminal = { branchId };

    const sales = await this.prisma.sale.findMany({
      where,
      select: { subtotal: true, taxAmount: true, totalAmount: true },
    });

    return {
      date,
      totalSales: sales.length,
      totalRevenue: sales.reduce((s, sale) => s + Number(sale.totalAmount), 0),
      totalTax: sales.reduce((s, sale) => s + Number(sale.taxAmount), 0),
    };
  }

  async getTopProducts(period: string, limit = 10) {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const items = await this.prisma.saleItem.groupBy({
      by: ['variantId'],
      where: { sale: { createdAt: { gte: since }, paymentStatus: 'SUCCESS' } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const variantIds = items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    return items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      return {
        product: variant?.product.name,
        variant: variant?.variantName,
        totalQuantity: item._sum.quantity,
        totalRevenue: item._sum.lineTotal,
      };
    });
  }

  async getCashReconciliation(date: string, branchId?: string) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const sessions = await this.prisma.cashSession.findMany({
      where: {
        openedAt: { gte: start, lt: end },
        ...(branchId ? { register: { branchId } } : {}),
      },
      include: { sales: true, register: true },
    });

    return sessions.map((session) => ({
      register: session.register.name,
      cashierId: session.cashierId,
      openingFloat: session.openingFloat,
      totalSales: session.sales.reduce((s, sale) => s + Number(sale.totalAmount), 0),
      closingFloat: session.closingFloat,
      status: session.status,
    }));
  }
}
