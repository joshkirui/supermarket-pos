import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count(),
    ]);
    return { data: customers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findUnique({ where: { phone } });
  }

  async create(data: { phone: string; name?: string; email?: string }) {
    return this.prisma.customer.upsert({
      where: { phone: data.phone },
      update: { name: data.name },
      create: { phone: data.phone, name: data.name, email: data.email },
    });
  }

  async addLoyaltyPoints(id: string, points: number) {
    return this.prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: { increment: points } },
    });
  }
}
