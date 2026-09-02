import PDFDocument from 'pdfkit';

export interface ReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface ReceiptData {
  saleNumber: string;
  date: Date;
  cashier: string;
  branch: string;
  items: ReceiptLine[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  payments: Array<{ method: string; amount: number; reference?: string }>;
  loyaltyPoints?: number;
}

export function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: [226, 400], // 80mm thermal receipt width
      margin: 10,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header
    doc.fontSize(14).font('Helvetica-Bold').text(data.branch, { align: 'center' });
    doc.fontSize(8).font('Helvetica').text('Point of Sale Receipt', { align: 'center' });
    doc.moveDown(0.3);

    // Divider
    doc.fontSize(7).text('─'.repeat(48), { align: 'center' });

    // Sale info
    doc.fontSize(8).text(`Receipt: ${data.saleNumber}`);
    doc.text(`Date: ${data.date.toLocaleDateString('en-KE')}`);
    doc.text(`Time: ${data.date.toLocaleTimeString('en-KE')}`);
    doc.text(`Cashier: ${data.cashier}`);
    doc.moveDown(0.3);

    // Divider
    doc.text('─'.repeat(48), { align: 'center' });

    // Column headers
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('Item', 10, doc.y, { width: 100, continued: true });
    doc.text('Qty', 110, doc.y, { width: 30, align: 'right', continued: true });
    doc.text('Price', 140, doc.y, { width: 40, align: 'right', continued: true });
    doc.text('Total', 180, doc.y, { width: 36, align: 'right' });

    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(7);
    doc.text('─'.repeat(48), { align: 'center' });

    // Items
    for (const item of data.items) {
      const y = doc.y;
      doc.text(item.name, 10, y, { width: 100, ellipsis: true, continued: true });
      doc.text(item.quantity.toString(), 110, y, { width: 30, align: 'right', continued: true });
      doc.text(formatCurrency(item.unitPrice), 140, y, { width: 40, align: 'right', continued: true });
      doc.text(formatCurrency(item.total), 180, y, { width: 36, align: 'right' });

      if (item.discount > 0) {
        doc.fontSize(6).text(`  Disc: -${formatCurrency(item.discount)}`, 10);
        doc.fontSize(7);
      }
    }

    doc.moveDown(0.3);
    doc.text('─'.repeat(48), { align: 'center' });

    // Totals
    const totalsX = 120;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', totalsX, doc.y, { width: 50, align: 'right', continued: true });
    doc.text(formatCurrency(data.subtotal), 175, doc.y, { width: 41, align: 'right' });

    doc.font('Helvetica');
    doc.text(`VAT (16%):`, totalsX, doc.y, { width: 50, align: 'right', continued: true });
    doc.text(formatCurrency(data.taxAmount), 175, doc.y, { width: 41, align: 'right' });

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('TOTAL:', totalsX, doc.y, { width: 50, align: 'right', continued: true });
    doc.text(formatCurrency(data.totalAmount), 175, doc.y, { width: 41, align: 'right' });

    doc.moveDown(0.3);
    doc.fontSize(7).font('Helvetica');
    doc.text('─'.repeat(48), { align: 'center' });

    // Payments
    doc.font('Helvetica-Bold').text('Payments:');
    doc.font('Helvetica');
    for (const payment of data.payments) {
      doc.text(`${payment.method}: ${formatCurrency(payment.amount)}`, 15);
      if (payment.reference) {
        doc.fontSize(6).text(`  Ref: ${payment.reference}`, 15);
        doc.fontSize(7);
      }
    }

    if (data.loyaltyPoints && data.loyaltyPoints > 0) {
      doc.moveDown(0.3);
      doc.text(`Loyalty Points Earned: ${data.loyaltyPoints}`, { align: 'center' });
    }

    doc.moveDown(0.5);
    doc.fontSize(7).text('─'.repeat(48), { align: 'center' });
    doc.fontSize(8).text('Thank you for shopping!', { align: 'center' });
    doc.fontSize(6).text('Karibu tena!', { align: 'center' });

    doc.end();
  });
}

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
