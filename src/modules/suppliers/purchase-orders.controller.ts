import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, ReceivePoDto } from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @RequirePermissions('inventory.adjust')
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Get()
  @RequirePermissions('inventory.view')
  findAll(
    @Query('status') status?: string,
    @CurrentUser('branchId') branchId?: string,
  ) {
    return this.purchaseOrdersService.findAll(branchId, status);
  }

  @Get(':id')
  @RequirePermissions('inventory.view')
  findById(@Param('id') id: string) {
    return this.purchaseOrdersService.findById(id);
  }

  @Post(':id/receive')
  @RequirePermissions('inventory.adjust')
  receive(@Param('id') id: string, @Body() dto: ReceivePoDto) {
    return this.purchaseOrdersService.receive(id, dto);
  }

  @Post(':id/cancel')
  @RequirePermissions('inventory.adjust')
  cancel(@Param('id') id: string) {
    return this.purchaseOrdersService.cancel(id);
  }
}
