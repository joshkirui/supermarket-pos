import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Sync')
@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('push')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('sale.create')
  push(
    @Body() body: { terminalId: string; records: Array<{
      operation: string;
      tableName: string;
      recordId: string;
      payload: any;
    }> },
  ) {
    return this.syncService.push(body.terminalId, body.records);
  }

  @Get('pull')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('product.view')
  pull(
    @Query('terminalId') terminalId: string,
    @Query('lastSyncVersion') lastSyncVersion?: number,
  ) {
    return this.syncService.pull(terminalId, lastSyncVersion);
  }

  @Post('process/:terminalId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('sale.create')
  processPending(@Param('terminalId') terminalId: string) {
    return this.syncService.processPending(terminalId);
  }

  @Get('status/:terminalId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('product.view')
  getSyncStatus(@Param('terminalId') terminalId: string) {
    return this.syncService.getSyncStatus(terminalId);
  }

  @Post('offline-mode/:terminalId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('sale.create')
  setOfflineMode(
    @Param('terminalId') terminalId: string,
    @Body('offline') offline: boolean,
  ) {
    return this.syncService.setOfflineMode(terminalId, offline);
  }
}
