import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class CashService {
  constructor(private prisma: PrismaService) {}

  async openSession(data: {
    registerId: string;
    cashierId: string;
    openingFloat: number;
  }) {
    const openSession = await this.prisma.cashSession.findFirst({
      where: { registerId: data.registerId, status: 'OPEN' },
    });

    if (openSession) {
      throw new BadRequestException('Register already has an open session');
    }

    return this.prisma.cashSession.create({
      data: {
        registerId: data.registerId,
        cashierId: data.cashierId,
        openingFloat: data.openingFloat,
        status: 'OPEN',
      },
    });
  }

  async closeSession(id: string, closingFloat: number) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: { sales: true, cashMovements: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'CLOSED') throw new BadRequestException('Session already closed');

    const totalSales = session.sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0,
    );

    const totalCashIn = session.cashMovements
      .filter((m) => m.type === 'CASH_IN')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const totalCashOut = session.cashMovements
      .filter((m) => m.type === 'CASH_OUT' || m.type === 'PETTY_CASH')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const expectedFloat = Number(session.openingFloat) + totalSales + totalCashIn - totalCashOut;
    const variance = closingFloat - expectedFloat;

    return this.prisma.cashSession.update({
      where: { id },
      data: {
        closedAt: new Date(),
        closingFloat,
        status: 'CLOSED',
      },
      include: { cashMovements: true },
    });
  }

  async getSessionSummary(id: string) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: {
        sales: {
          include: { payments: { include: { method: true } } },
        },
        cashMovements: true,
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    const totalSales = session.sales.length;
    const totalRevenue = session.sales.reduce(
      (sum, sale) => sum + Number(sale.totalAmount),
      0,
    );

    const paymentsByMethod: Record<string, number> = {};
    for (const sale of session.sales) {
      for (const payment of sale.payments) {
        const method = payment.method.name;
        paymentsByMethod[method] = (paymentsByMethod[method] || 0) + Number(payment.amount);
      }
    }

    const cashIn = session.cashMovements
      .filter((m) => m.type === 'CASH_IN')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    const cashOut = session.cashMovements
      .filter((m) => m.type === 'CASH_OUT' || m.type === 'PETTY_CASH')
      .reduce((sum, m) => sum + Number(m.amount), 0);

    return {
      sessionId: id,
      cashierId: session.cashierId,
      openedAt: session.openedAt,
      totalSales,
      totalRevenue,
      openingFloat: session.openingFloat,
      paymentsByMethod,
      cashIn,
      cashOut,
      expectedFloat: Number(session.openingFloat) + totalRevenue + cashIn - cashOut,
    };
  }

  async cashIn(data: {
    sessionId: string;
    amount: number;
    description: string;
    userId: string;
  }) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.status === 'CLOSED') {
      throw new BadRequestException('Session not found or already closed');
    }

    return this.prisma.cashMovement.create({
      data: {
        sessionId: data.sessionId,
        type: 'CASH_IN',
        amount: data.amount,
        description: data.description,
        recordedById: data.userId,
      },
    });
  }

  async cashOut(data: {
    sessionId: string;
    amount: number;
    description: string;
    userId: string;
  }) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.status === 'CLOSED') {
      throw new BadRequestException('Session not found or already closed');
    }

    return this.prisma.cashMovement.create({
      data: {
        sessionId: data.sessionId,
        type: 'CASH_OUT',
        amount: data.amount,
        description: data.description,
        recordedById: data.userId,
      },
    });
  }

  async pettyCash(data: {
    sessionId: string;
    amount: number;
    description: string;
    userId: string;
  }) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.status === 'CLOSED') {
      throw new BadRequestException('Session not found or already closed');
    }

    return this.prisma.cashMovement.create({
      data: {
        sessionId: data.sessionId,
        type: 'PETTY_CASH',
        amount: data.amount,
        description: data.description,
        recordedById: data.userId,
      },
    });
  }
}
