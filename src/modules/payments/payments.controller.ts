import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, PaymentQueryDto, MpesaCallbackDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('payment.initiate')
  @ApiOperation({ summary: 'Initiate a payment (M-Pesa STK push, etc.)' })
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(dto);
  }

  @Post('callback/mpesa')
  @ApiOperation({ summary: 'M-Pesa callback endpoint (no auth - called by Safaricom)' })
  handleMpesaCallback(@Body() callback: MpesaCallbackDto) {
    return this.paymentsService.handleMpesaCallback(callback);
  }

  @Get(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('payment.initiate')
  getPaymentStatus(@Param('id') id: string) {
    return this.paymentsService.getPaymentStatus(id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('payment.initiate')
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAll(query);
  }
}
