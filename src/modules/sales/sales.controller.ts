import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { SalesService } from './sales.service';
import { ReceiptService } from './receipt.service';
import { RefundsService } from './refunds.service';
import { CreateSaleDto, SaleQueryDto } from './dto/sale.dto';
import { CreateRefundDto } from './dto/refund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private salesService: SalesService,
    private receiptService: ReceiptService,
    private refundsService: RefundsService,
  ) {}

  @Post()
  @RequirePermissions('sale.create')
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiHeader({ name: 'Idempotency-Key', required: false })
  create(
    @Body() dto: CreateSaleDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser('id') userId: string,
  ) {
    if (idempotencyKey && !dto.idempotencyKey) {
      dto.idempotencyKey = idempotencyKey;
    }
    return this.salesService.create(dto, userId);
  }

  @Get()
  @RequirePermissions('sale.view')
  findAll(
    @Query() query: SaleQueryDto,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.salesService.findAll(query, branchId);
  }

  @Get('daily-summary')
  @RequirePermissions('sale.view')
  getDailySummary(
    @Query('date') date: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.salesService.getDailySummary(date, branchId);
  }

  @Get(':id')
  @RequirePermissions('sale.view')
  findById(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Get(':id/receipt')
  @RequirePermissions('sale.view')
  @ApiOperation({ summary: 'Generate PDF receipt for a sale' })
  async getReceipt(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.receiptService.generateReceipt(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
    });
    res.send(pdf);
  }

  @Post('refunds')
  @RequirePermissions('sale.refund.create')
  @ApiOperation({ summary: 'Create a refund' })
  @ApiHeader({ name: 'Idempotency-Key', required: false })
  createRefund(
    @Body() dto: CreateRefundDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser('id') userId: string,
  ) {
    if (idempotencyKey && !dto.idempotencyKey) {
      dto.idempotencyKey = idempotencyKey;
    }
    return this.refundsService.create(dto, userId);
  }

  @Get('refunds')
  @RequirePermissions('sale.view')
  findAllRefunds(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.refundsService.findAll(status, page, limit);
  }

  @Post('refunds/:id/approve')
  @RequirePermissions('sale.refund.approve')
  approveRefund(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.refundsService.approve(id, userId);
  }

  @Post('refunds/:id/reject')
  @RequirePermissions('sale.refund.approve')
  rejectRefund(@Param('id') id: string) {
    return this.refundsService.reject(id);
  }
}
