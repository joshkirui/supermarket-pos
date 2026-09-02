import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where: { isActive: true } }),
    ]);
    return { data: suppliers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(data: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string }) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; contactPerson: string; phone: string; email: string; address: string; isActive: boolean }>) {
    await this.findById(id);
    return this.prisma.supplier.update({ where: { id }, data });
  }
}
