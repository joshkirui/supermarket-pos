import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Get()
  @RequirePermissions('product.view')
  findAll(@Query('isActive') isActive?: boolean) {
    return this.promotionsService.findAll(isActive);
  }

  @Get('active')
  @RequirePermissions('product.view')
  getActive() {
    return this.promotionsService.getActivePromotions();
  }

  @Get(':id')
  @RequirePermissions('product.view')
  findById(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @Post()
  @RequirePermissions('product.create')
  create(@Body() body: {
    name: string;
    type: string;
    value: number;
    startDate: string;
    endDate: string;
    minQuantity?: number;
    appliesTo?: string;
    targetId?: string;
  }) {
    return this.promotionsService.create(body);
  }

  @Put(':id')
  @RequirePermissions('product.update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.promotionsService.update(id, body);
  }
}
