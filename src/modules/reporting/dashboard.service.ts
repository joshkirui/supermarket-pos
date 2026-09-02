import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs(branchId?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const saleWhere: any = { paymentStatus: 'SUCCESS' };
    if (branchId) saleWhere.terminal = { branchId };

    const [todaySales, monthSales, totalProducts, lowStockCount, pendingRefunds, todayCustomers] =
      await Promise.all([
        this.prisma.sale.aggregate({
          where: { ...saleWhere, createdAt: { gte: todayStart } },
          _sum: { totalAmount: true, taxAmount: true },
          _count: true,
        }),
        this.prisma.sale.aggregate({
          where: { ...saleWhere, createdAt: { gte: monthStart } },
          _sum: { totalAmount: true, taxAmount: true },
          _count: true,
        }),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.productVariant.findMany({ where: { isActive: true } }).then((variants) =>
          variants.filter((v) => v.stockQuantity <= v.reorderLevel).length
        ),
        this.prisma.refund.count({ where: { status: 'PENDING' } }),
        this.prisma.customer.count(),
      ]);

    return {
      today: {
        sales: todaySales._count,
        revenue: Number(todaySales._sum.totalAmount || 0),
        tax: Number(todaySales._sum.taxAmount || 0),
      },
      month: {
        sales: monthSales._count,
        revenue: Number(monthSales._sum.totalAmount || 0),
        tax: Number(monthSales._sum.taxAmount || 0),
      },
      inventory: {
        totalProducts,
        lowStockCount,
      },
      pendingRefunds,
      totalCustomers: todayCustomers,
    };
  }

  async getSalesChart(branchId?: string, days = 7) {
    const results = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const where: any = {
        paymentStatus: 'SUCCESS',
        createdAt: { gte: dayStart, lt: dayEnd },
      };
      if (branchId) where.terminal = { branchId };

      const sales = await this.prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true },
        _count: true,
      });

      results.push({
        date: dayStart.toISOString().split('T')[0],
        sales: sales._count,
        revenue: Number(sales._sum.totalAmount || 0),
      });
    }

    return results;
  }

  async getTopCashiers(branchId?: string, limit = 5) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const where: any = {
      paymentStatus: 'SUCCESS',
      createdAt: { gte: monthStart },
    };
    if (branchId) where.terminal = { branchId };

    const sales = await this.prisma.sale.findMany({
      where,
      include: { cashSession: { include: { cashier: true } } },
    });

    const cashierMap: Record<string, { name: string; sales: number; revenue: number }> = {};

    for (const sale of sales) {
      const cashierId = sale.cashSession?.cashierId;
      if (!cashierId) continue;

      if (!cashierMap[cashierId]) {
        cashierMap[cashierId] = {
          name: sale.cashSession?.cashier?.fullName || 'Unknown',
          sales: 0,
          revenue: 0,
        };
      }
      cashierMap[cashierId].sales++;
      cashierMap[cashierId].revenue += Number(sale.totalAmount);
    }

    return Object.values(cashierMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}
