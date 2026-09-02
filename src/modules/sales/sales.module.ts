import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ReceiptService } from './receipt.service';
import { RefundsService } from './refunds.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SalesController],
  providers: [SalesService, ReceiptService, RefundsService],
  exports: [SalesService, RefundsService],
})
export class SalesModule {}
