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

export class RefundItemInput {
  @ApiProperty()
  @IsUUID()
  saleItemId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.001)
  quantityReturned: number;

  @ApiProperty({ example: 85.0 })
  @IsNumber()
  @Min(0)
  unitRefundAmount: number;
}

export class CreateRefundDto {
  @ApiProperty()
  @IsUUID()
  originalSaleId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ type: [RefundItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RefundItemInput)
  items: RefundItemInput[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class ApproveRefundDto {
  @ApiProperty({ example: 'Refund approved' })
  @IsString()
  notes: string;
}
