import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Shifts & Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get()
  @RequirePermissions('user.create')
  findAll(@CurrentUser('branchId') branchId?: string) {
    return this.shiftsService.findAll(branchId);
  }

  @Post()
  @RequirePermissions('user.create')
  create(@Body() body: { name: string; startTime: string; endTime: string }, @CurrentUser('branchId') branchId: string) {
    return this.shiftsService.create({ ...body, branchId });
  }

  @Put(':id')
  @RequirePermissions('user.update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.shiftsService.update(id, body);
  }

  @Get('schedule/:userId')
  @RequirePermissions('user.create')
  getSchedule(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shiftsService.getSchedule(userId, startDate, endDate);
  }

  @Post('schedule')
  @RequirePermissions('user.create')
  createSchedule(@Body() body: { userId: string; shiftId: string; date: string }) {
    return this.shiftsService.createSchedule(body);
  }

  @Post('schedule/:id/check-in')
  @RequirePermissions('user.create')
  checkIn(@Param('id') id: string) {
    return this.shiftsService.checkIn(id);
  }

  @Post('schedule/:id/check-out')
  @RequirePermissions('user.create')
  checkOut(@Param('id') id: string) {
    return this.shiftsService.checkOut(id);
  }

  @Post('schedule/:id/absent')
  @RequirePermissions('user.create')
  markAbsent(@Param('id') id: string) {
    return this.shiftsService.markAbsent(id);
  }
}
