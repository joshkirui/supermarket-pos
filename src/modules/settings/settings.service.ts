import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value;
  }

  async getAll() {
    const settings = await this.prisma.systemSetting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, any>);
  }

  async set(key: string, value: any, description?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
  }

  async setMany(settings: Array<{ key: string; value: any; description?: string }>) {
    const ops = settings.map((s) =>
      this.prisma.systemSetting.upsert({
        where: { key: s.key },
        update: { value: s.value, description: s.description },
        create: { key: s.key, value: s.value, description: s.description },
      }),
    );
    return Promise.all(ops);
  }

  async initDefaults() {
    const defaults = [
      { key: 'store.name', value: 'My Supermarket', description: 'Store name for receipts' },
      { key: 'store.address', value: 'Nairobi, Kenya', description: 'Store address' },
      { key: 'store.phone', value: '+254700000000', description: 'Store phone number' },
      { key: 'store.tax_rate', value: 16, description: 'Default VAT rate (%)' },
      { key: 'store.currency', value: 'KES', description: 'Currency code' },
      { key: 'receipt.header', value: 'Thank you for shopping!', description: 'Receipt header text' },
      { key: 'receipt.footer', value: 'Karibu tena!', description: 'Receipt footer text' },
      { key: 'loyalty.points_per_kes', value: 1, description: 'Loyalty points per KES spent' },
      { key: 'loyalty.bronze_threshold', value: 0, description: 'Bronze tier threshold' },
      { key: 'loyalty.silver_threshold', value: 10000, description: 'Silver tier threshold' },
      { key: 'loyalty.gold_threshold', value: 50000, description: 'Gold tier threshold' },
    ];

    return this.setMany(defaults);
  }
}
