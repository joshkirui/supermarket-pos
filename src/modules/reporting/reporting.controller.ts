import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { DashboardService } from './dashboard.service';
import { ForecastingService } from './forecasting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports, Dashboard & Forecasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class ReportingController {
  constructor(
    private reportingService: ReportingService,
    private dashboardService: DashboardService,
    private forecastingService: ForecastingService,
  ) {}

  @Get('reports/daily-summary')
  @RequirePermissions('report.view_sales')
  getDailySummary(
    @Query('date') date: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.reportingService.getDailySummary(date, branchId);
  }

  @Get('reports/top-products')
  @RequirePermissions('report.view_sales')
  getTopProducts(
    @Query('period') period: string,
    @Query('limit') limit: number,
  ) {
    return this.reportingService.getTopProducts(period, limit);
  }

  @Get('reports/cash-reconciliation')
  @RequirePermissions('report.view_sales')
  getCashReconciliation(
    @Query('date') date: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.reportingService.getCashReconciliation(date, branchId);
  }

  @Get('dashboard/kpis')
  @RequirePermissions('report.view_sales')
  getKPIs(@CurrentUser('branchId') branchId: string) {
    return this.dashboardService.getKPIs(branchId);
  }

  @Get('dashboard/sales-chart')
  @RequirePermissions('report.view_sales')
  getSalesChart(
    @Query('days') days: number,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.dashboardService.getSalesChart(branchId, days);
  }

  @Get('dashboard/top-cashiers')
  @RequirePermissions('report.view_sales')
  getTopCashiers(
    @Query('limit') limit: number,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.dashboardService.getTopCashiers(branchId, limit);
  }

  @Get('forecast/low-stock')
  @RequirePermissions('report.view_sales')
  getLowStockForecasts() {
    return this.forecastingService.getLowStockForecasts();
  }

  @Post('forecast/generate')
  @RequirePermissions('report.view_sales')
  generateForecast(
    @Body() body: { productId: string; branchId: string; days?: number },
  ) {
    return this.forecastingService.generateForecast(body.productId, body.branchId, body.days);
  }

  @Post('forecast/save')
  @RequirePermissions('report.view_sales')
  saveForecasts(
    @Body() body: { productId: string; branchId: string; forecasts: Array<{ date: string; predictedQty: number; confidence: number }> },
  ) {
    return this.forecastingService.saveForecasts(body.productId, body.branchId, body.forecasts);
  }
}
