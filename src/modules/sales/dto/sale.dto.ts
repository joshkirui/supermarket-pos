import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleItemInput {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 85.0 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}

export class CreateSaleDto {
  @ApiProperty()
  @IsString()
  terminalId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cashSessionId?: string;

  @ApiProperty({ type: [SaleItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemInput)
  items: SaleItemInput[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class SaleQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cashierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
