import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    const where: any = { isActive: true };
    if (branchId) where.branchId = branchId;

    return this.prisma.shift.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  async create(data: { branchId: string; name: string; startTime: string; endTime: string }) {
    return this.prisma.shift.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; startTime: string; endTime: string; isActive: boolean }>) {
    await this.prisma.shift.findUniqueOrThrow({ where: { id } });
    return this.prisma.shift.update({ where: { id }, data });
  }

  async getSchedule(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.prisma.schedule.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: { shift: true },
      orderBy: { date: 'asc' },
    });
  }

  async createSchedule(data: { userId: string; shiftId: string; date: string }) {
    const date = new Date(data.date);

    const existing = await this.prisma.schedule.findUnique({
      where: { userId_date: { userId: data.userId, date } },
    });

    if (existing) {
      throw new BadRequestException('Schedule already exists for this date');
    }

    return this.prisma.schedule.create({
      data: {
        userId: data.userId,
        shiftId: data.shiftId,
        date,
      },
      include: { shift: true },
    });
  }

  async checkIn(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status === 'CHECKED_IN' || schedule.status === 'CHECKED_OUT') {
      throw new BadRequestException('Already checked in');
    }

    return this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CHECKED_IN',
        checkIn: new Date(),
      },
    });
  }

  async checkOut(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) throw new NotFoundException('Schedule not found');
    if (schedule.status !== 'CHECKED_IN') {
      throw new BadRequestException('Not checked in');
    }

    return this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'CHECKED_OUT',
        checkOut: new Date(),
      },
    });
  }

  async markAbsent(scheduleId: string) {
    return this.prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: 'ABSENT' },
    });
  }
}
