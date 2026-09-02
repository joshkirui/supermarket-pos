import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Customers & Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private loyaltyService: LoyaltyService,
  ) {}

  @Get()
  @RequirePermissions('customer.view')
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.customersService.findAll(page, limit);
  }

  @Get('phone/:phone')
  @RequirePermissions('customer.view')
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Post()
  @RequirePermissions('customer.create')
  create(@Body() body: { phone: string; name?: string; email?: string }) {
    return this.customersService.create(body);
  }

  @Get(':id/loyalty/balance')
  @RequirePermissions('customer.view')
  getLoyaltyBalance(@Param('id') id: string) {
    return this.loyaltyService.getBalance(id);
  }

  @Get(':id/loyalty/history')
  @RequirePermissions('customer.view')
  getLoyaltyHistory(
    @Param('id') id: string,
    @Query('page') page?: number,
  ) {
    return this.loyaltyService.getTransactionHistory(id, page);
  }

  @Post(':id/loyalty/redeem')
  @RequirePermissions('customer.update')
  redeemPoints(
    @Param('id') id: string,
    @Body() body: { saleId: string; points: number },
  ) {
    return this.loyaltyService.redeemPoints(id, body.saleId, body.points);
  }

  @Post('loyalty/calculate')
  @RequirePermissions('customer.view')
  calculatePoints(@Body('amount') amount: number) {
    return this.loyaltyService.calculatePointsEarned(amount);
  }
}
