import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions('product.view')
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.suppliersService.findAll(page, limit);
  }

  @Get(':id')
  @RequirePermissions('product.view')
  findById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Post()
  @RequirePermissions('product.create')
  create(@Body() body: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string }) {
    return this.suppliersService.create(body);
  }

  @Put(':id')
  @RequirePermissions('product.update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.update(id, body);
  }
}
