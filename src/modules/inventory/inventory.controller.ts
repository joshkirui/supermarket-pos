import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @RequirePermissions('inventory.view')
  getStockLevels(
    @Query('variantId') variantId?: string,
    @CurrentUser('branchId') branchId?: string,
  ) {
    return this.inventoryService.getStockLevels(variantId, branchId);
  }

  @Get('low-stock')
  @RequirePermissions('inventory.view')
  getLowStock(@CurrentUser('branchId') branchId?: string) {
    return this.inventoryService.getLowStock(branchId);
  }

  @Get(':variantId/movements')
  @RequirePermissions('inventory.view')
  getMovementHistory(
    @Param('variantId') variantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getStockMovementHistory(variantId, page, limit);
  }

  @Post('adjust')
  @RequirePermissions('inventory.adjust')
  adjust(
    @Body() body: { variantId: string; quantityChange: number; reason: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.adjust({ ...body, userId });
  }

  @Post('transfer')
  @RequirePermissions('inventory.transfer')
  transfer(
    @Body() body: { variantId: string; quantity: number; toBranchId: string },
    @CurrentUser('branchId') fromBranchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.transfer({ ...body, fromBranchId, userId });
  }

  @Post('damage')
  @RequirePermissions('inventory.adjust')
  recordDamage(
    @Body() body: { variantId: string; quantity: number; reason: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.recordDamage({ ...body, userId });
  }
}
