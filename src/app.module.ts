import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CashManagementModule } from './modules/cash-management/cash.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AuditModule } from './modules/audit/audit.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    SalesModule,
    PaymentsModule,
    CustomersModule,
    InventoryModule,
    CashManagementModule,
    ReportingModule,
    AuditModule,
    SuppliersModule,
    EmployeesModule,
    SettingsModule,
    PromotionsModule,
    SyncModule,
  ],
})
export class AppModule {}
