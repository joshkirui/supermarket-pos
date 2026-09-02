import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @RequirePermissions('user.create')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('branchId') branchId?: string,
  ) {
    return this.employeesService.findAll(branchId, page, limit);
  }

  @Get(':id')
  @RequirePermissions('user.create')
  findById(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Post()
  @RequirePermissions('user.create')
  create(@Body() body: {
    username: string;
    password: string;
    fullName: string;
    phone?: string;
    email?: string;
    branchId: string;
    roleId: string;
    hireDate?: string;
  }) {
    return this.employeesService.create(body);
  }

  @Put(':id')
  @RequirePermissions('user.update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.update(id, body);
  }

  @Post(':id/reset-pin')
  @RequirePermissions('user.update')
  resetPin(@Param('id') id: string, @Body('newPin') newPin: string) {
    return this.employeesService.resetPin(id, newPin);
  }
}
