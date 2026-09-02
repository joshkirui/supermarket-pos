import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CashService } from './cash.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cash Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cash-sessions')
export class CashController {
  constructor(private cashService: CashService) {}

  @Post('open')
  @RequirePermissions('cash.session.open')
  open(
    @Body() body: { registerId: string; openingFloat: number },
    @CurrentUser('id') cashierId: string,
  ) {
    return this.cashService.openSession({ ...body, cashierId });
  }

  @Post(':id/close')
  @RequirePermissions('cash.session.close')
  close(@Param('id') id: string, @Body('closingFloat') closingFloat: number) {
    return this.cashService.closeSession(id, closingFloat);
  }

  @Get(':id/summary')
  @RequirePermissions('cash.session.view')
  getSummary(@Param('id') id: string) {
    return this.cashService.getSessionSummary(id);
  }

  @Post(':id/cash-in')
  @RequirePermissions('cash.session.open')
  cashIn(
    @Param('id') sessionId: string,
    @Body() body: { amount: number; description: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.cashService.cashIn({ ...body, sessionId, userId });
  }

  @Post(':id/cash-out')
  @RequirePermissions('cash.session.open')
  cashOut(
    @Param('id') sessionId: string,
    @Body() body: { amount: number; description: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.cashService.cashOut({ ...body, sessionId, userId });
  }

  @Post(':id/petty-cash')
  @RequirePermissions('cash.session.open')
  pettyCash(
    @Param('id') sessionId: string,
    @Body() body: { amount: number; description: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.cashService.pettyCash({ ...body, sessionId, userId });
  }
}
