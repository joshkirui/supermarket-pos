import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { LoyaltyService } from './loyalty.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, LoyaltyService],
  exports: [CustomersService, LoyaltyService],
})
export class CustomersModule {}
