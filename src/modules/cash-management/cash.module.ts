import { Module } from '@nestjs/common';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CashController, ExpensesController],
  providers: [CashService, ExpensesService],
  exports: [CashService, ExpensesService],
})
export class CashManagementModule {}
