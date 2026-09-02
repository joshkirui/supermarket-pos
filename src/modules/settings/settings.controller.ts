import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @RequirePermissions('report.view_sales')
  getAll() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  @RequirePermissions('report.view_sales')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Post()
  @RequirePermissions('user.create')
  set(@Body() body: { key: string; value: any; description?: string }) {
    return this.settingsService.set(body.key, body.value, body.description);
  }

  @Post('init')
  @RequirePermissions('user.create')
  initDefaults() {
    return this.settingsService.initDefaults();
  }
}
