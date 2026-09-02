import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { DashboardService } from './dashboard.service';
import { ForecastingService } from './forecasting.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReportingController],
  providers: [ReportingService, DashboardService, ForecastingService],
  exports: [ReportingService, DashboardService, ForecastingService],
})
export class ReportingModule {}
