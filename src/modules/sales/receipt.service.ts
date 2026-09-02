import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { generateReceiptPdf, ReceiptData } from '../../common/utils/receipt-pdf';

@Injectable()
export class ReceiptService {
  constructor(private prisma: PrismaService) {}

  async generateReceipt(saleId: string): Promise<Buffer> {
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
        payments: { include: { method: true } },
        terminal: { include: { branch: true } },
        customer: true,
      },
    });

    if (!sale) throw new NotFoundException('Sale not found');

    const receiptData: ReceiptData = {
      saleNumber: sale.saleNumber,
      date: sale.createdAt,
      cashier: 'Cashier', // Would come from session/user
      branch: sale.terminal?.branch?.name || 'POS',
      items: sale.items.map((item) => ({
        name: item.variant.product.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discountAmount),
        total: Number(item.lineTotal),
      })),
      subtotal: Number(sale.subtotal),
      taxAmount: Number(sale.taxAmount),
      totalAmount: Number(sale.totalAmount),
      payments: sale.payments.map((p) => ({
        method: p.method.name,
        amount: Number(p.amount),
        reference: p.referenceNumber || undefined,
      })),
    };

    return generateReceiptPdf(receiptData);
  }
}
