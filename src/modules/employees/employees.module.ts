import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EmployeesController, ShiftsController],
  providers: [EmployeesService, ShiftsService],
  exports: [EmployeesService, ShiftsService],
})
export class EmployeesModule {}
