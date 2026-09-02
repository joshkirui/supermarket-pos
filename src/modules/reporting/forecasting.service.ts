import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ForecastingService {
  private readonly logger = new Logger(ForecastingService.name);
  constructor(private prisma: PrismaService) {}

  async generateForecast(productId: string, branchId: string, days = 30) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const sales = await this.prisma.saleItem.findMany({
      where: {
        variant: { productId },
        sale: { paymentStatus: 'SUCCESS', createdAt: { gte: ninetyDaysAgo } },
      },
      include: { sale: { select: { createdAt: true } } },
    });

    const dailySales: Record<string, number> = {};
    for (const item of sales) {
      const date = item.sale.createdAt.toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + Number(item.quantity);
    }

    const values = Object.values(dailySales);
    const avgDaily = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    const forecasts = [];
    const today = new Date();
    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(forecastDate.getDate() + i);
      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedQty: Math.round(avgDaily),
        confidence: values.length > 14 ? 0.8 : 0.5,
      });
    }

    return { productId, branchId, avgDaily, forecasts };
  }

  async saveForecasts(productId: string, branchId: string, forecasts: Array<{ date: string; predictedQty: number; confidence: number }>) {
    const ops = forecasts.map((f) =>
      this.prisma.salesForecast.upsert({
        where: { productId_branchId_date: { productId, branchId, date: new Date(f.date) } },
        update: { predictedQty: f.predictedQty, confidence: f.confidence },
        create: { productId, branchId, date: new Date(f.date), predictedQty: f.predictedQty, confidence: f.confidence },
      }),
    );
    return Promise.all(ops);
  }

  async getLowStockForecasts(branchId?: string) {
    const variants = await this.prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: true },
    });

    const lowStock = variants.filter((v) => v.stockQuantity <= v.reorderLevel);
    return lowStock.map((v) => ({
      variantId: v.id,
      product: v.product.name,
      currentStock: v.stockQuantity,
      reorderLevel: v.reorderLevel,
      deficit: v.reorderLevel - v.stockQuantity,
    }));
  }
}
