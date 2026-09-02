import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    branchId: string;
    category: string;
    description?: string;
    amount: number;
    receiptUrl?: string;
    recordedById: string;
  }) {
    return this.prisma.expense.create({ data });
  }

  async findAll(branchId?: string, category?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (category) where.category = category;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { recordedBy: { select: { fullName: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { data: expenses, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSummary(branchId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const expenses = await this.prisma.expense.findMany({
      where: {
        branchId,
        createdAt: { gte: start, lt: end },
      },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const expense of expenses) {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + Number(expense.amount);
      total += Number(expense.amount);
    }

    return { total, byCategory, count: expenses.length };
  }
}
