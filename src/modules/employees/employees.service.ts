import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (branchId) where.branchId = branchId;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { role: true, branch: true },
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        phone: u.phone,
        email: u.email,
        role: u.role.name,
        branch: u.branch.name,
        hireDate: u.hireDate,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, branch: true },
    });
    if (!user) throw new NotFoundException('Employee not found');
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role.name,
      branch: user.branch.name,
      hireDate: user.hireDate,
      isActive: user.isActive,
    };
  }

  async create(data: {
    username: string;
    password: string;
    fullName: string;
    phone?: string;
    email?: string;
    branchId: string;
    roleId: string;
    hireDate?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) {
      throw new ConflictException(`Username "${data.username}" already exists`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const pinHash = await bcrypt.hash(data.password.slice(-4), 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        pinHash,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        branchId: data.branchId,
        roleId: data.roleId,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
      },
      include: { role: true, branch: true },
    });
  }

  async update(id: string, data: Partial<{
    fullName: string;
    phone: string;
    email: string;
    roleId: string;
    isActive: boolean;
  }>) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  }

  async resetPin(id: string, newPin: string) {
    await this.findById(id);
    const pinHash = await bcrypt.hash(newPin, 10);
    return this.prisma.user.update({
      where: { id },
      data: { pinHash },
    });
  }
}
