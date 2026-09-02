import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    return this.prisma.promotion.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const promo = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Promotion not found');
    return promo;
  }

  async create(data: {
    name: string;
    type: string;
    value: number;
    startDate: string;
    endDate: string;
    minQuantity?: number;
    appliesTo?: string;
    targetId?: string;
  }) {
    return this.prisma.promotion.create({
      data: {
        name: data.name,
        type: data.type as any,
        value: data.value,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        minQuantity: data.minQuantity || 1,
        appliesTo: (data.appliesTo as any) || 'ALL',
        targetId: data.targetId,
      },
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    value: number;
    endDate: string;
    isActive: boolean;
  }>) {
    await this.findById(id);
    return this.prisma.promotion.update({ where: { id }, data });
  }

  async getActivePromotions() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }
}
