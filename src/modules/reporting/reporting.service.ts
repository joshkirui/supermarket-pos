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

  async getDepartmentReport(period: string, branchId?: string) {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const categories = await this.prisma.category.findMany({
      include: {
        products: {
          include: {
            variants: {
              include: {
                saleItems: {
                  where: { sale: { createdAt: { gte: since }, paymentStatus: 'SUCCESS' } },
                  include: { sale: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => {
      const products = cat.products.map((prod) => {
        const allSaleItems = prod.variants.flatMap((v) => v.saleItems);
        const totalQty = allSaleItems.reduce((s, i) => s + Number(i.quantity), 0);
        const totalRevenue = allSaleItems.reduce((s, i) => s + Number(i.lineTotal), 0);
        const totalCost = prod.variants.reduce((s, v) => s + Number(v.costPrice) * (v.saleItems.reduce((si, i) => si + Number(i.quantity), 0)), 0);
        return {
          id: prod.id,
          name: prod.name,
          sku: prod.sku,
          unitsSold: totalQty,
          revenue: totalRevenue,
          cost: totalCost,
          profit: totalRevenue - totalCost,
          currentStock: prod.variants.reduce((s, v) => s + v.stockQuantity, 0),
        };
      });

      const deptRevenue = products.reduce((s, p) => s + p.revenue, 0);
      const deptCost = products.reduce((s, p) => s + p.cost, 0);
      const deptQty = products.reduce((s, p) => s + p.unitsSold, 0);

      return {
        department: cat.name,
        totalRevenue: deptRevenue,
        totalCost: deptCost,
        totalProfit: deptRevenue - deptCost,
        totalUnitsSold: deptQty,
        productCount: products.length,
        products: products.filter((p) => p.unitsSold > 0).sort((a, b) => b.revenue - a.revenue),
      };
    }).filter((d) => d.productCount > 0);
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
