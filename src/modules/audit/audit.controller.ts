import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @RequirePermissions('report.view_sales')
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findAll({ userId, action, entityType, startDate, endDate, page, limit });
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('report.view_sales')
  findByEntity(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  @Get('activity/:userId')
  @RequirePermissions('report.view_sales')
  getActivityLogs(@Param('userId') userId: string, @Query('page') page?: number) {
    return this.auditService.getActivityLogs(userId, page);
  }

  @Get('export')
  @RequirePermissions('report.view_sales')
  exportLog(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.auditService.exportAuditLog({ startDate, endDate, entityType });
  }
}
