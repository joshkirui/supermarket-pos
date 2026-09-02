import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { MpesaService } from './integrations/mpesa.service';
import { InitiatePaymentDto, PaymentQueryDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private mpesaService: MpesaService,
  ) {}

  async initiate(dto: InitiatePaymentDto) {
    const sale = await this.prisma.sale.findUnique({
      where: { id: dto.saleId },
      include: { payments: true },
    });

    if (!sale) throw new NotFoundException('Sale not found');

    if (sale.paymentStatus === 'SUCCESS') {
      throw new BadRequestException('Sale is already fully paid');
    }

    if (dto.idempotencyKey) {
      const existing = await this.prisma.payment.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    const method = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.methodId },
    });

    if (!method) throw new NotFoundException('Payment method not found');

    const payment = await this.prisma.payment.create({
      data: {
        saleId: dto.saleId,
        methodId: dto.methodId,
        amount: dto.amount,
        currency: 'KES',
        status: 'PENDING',
        idempotencyKey: dto.idempotencyKey,
      },
    });

    if (method.code === 'MPESA' && dto.phoneNumber) {
      try {
        const stkResponse = await this.mpesaService.initiateStkPush(
          dto.phoneNumber,
          dto.amount,
          sale.saleNumber,
        );

        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PROCESSING' },
        });

        return { payment, stkResponse };
      } catch (error) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        throw new BadRequestException('M-Pesa STK push failed');
      }
    }

    return payment;
  }

  async handleMpesaCallback(callback: any) {
    const { stkCallback } = callback.Body;

    this.logger.log(`M-Pesa callback received: ${stkCallback.CheckoutRequestID}`);

    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { idempotencyKey: stkCallback.CheckoutRequestID },
          { referenceNumber: stkCallback.MpesaReceiptNumber },
        ],
      },
    });

    if (!payment) {
      this.logger.warn(`No payment found for ${stkCallback.CheckoutRequestID}`);
      return { status: 'not_found' };
    }

    if (payment.callbackReceived) {
      this.logger.log(`Duplicate callback for payment ${payment.id}`);
      return { status: 'duplicate' };
    }

    const newStatus = stkCallback.ResultCode === 0 ? 'SUCCESS' : 'FAILED';

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          callbackReceived: true,
          referenceNumber: stkCallback.MpesaReceiptNumber || payment.referenceNumber,
        },
      });

      if (newStatus === 'SUCCESS') {
        const salePayments = await tx.payment.findMany({
          where: { saleId: payment.saleId, status: 'SUCCESS' },
        });

        const totalPaid = salePayments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );

        const sale = await tx.sale.findUnique({
          where: { id: payment.saleId },
        });

        if (sale && totalPaid >= Number(sale.totalAmount)) {
          await tx.sale.update({
            where: { id: payment.saleId },
            data: { paymentStatus: 'SUCCESS' },
          });
        } else if (sale && totalPaid > 0) {
          await tx.sale.update({
            where: { id: payment.saleId },
            data: { paymentStatus: 'PARTIAL' },
          });
        }
      }
    });

    return { status: newStatus.toLowerCase() };
  }

  async getPaymentStatus(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { method: true, sale: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findAll(query: PaymentQueryDto) {
    const { saleId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (saleId) where.saleId = saleId;
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { method: true, sale: { select: { saleNumber: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
