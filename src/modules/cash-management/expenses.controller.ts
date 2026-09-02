import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @RequirePermissions('cash.session.open')
  create(
    @Body() body: { category: string; description?: string; amount: number; receiptUrl?: string },
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.expensesService.create({ ...body, branchId, recordedById: userId });
  }

  @Get()
  @RequirePermissions('report.view_sales')
  findAll(
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser('branchId') branchId?: string,
  ) {
    return this.expensesService.findAll(branchId, category, page, limit);
  }

  @Get('summary')
  @RequirePermissions('report.view_sales')
  getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.expensesService.getSummary(branchId, startDate, endDate);
  }
}
