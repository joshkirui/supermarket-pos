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

export class PoItemInput {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantityOrdered: number;

  @ApiProperty({ example: 60.0 })
  @IsNumber()
  @Min(0)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  @IsUUID()
  supplierId: string;

  @ApiProperty()
  @IsUUID()
  branchId: string;

  @ApiProperty({ type: [PoItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoItemInput)
  items: PoItemInput[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedDelivery?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class ReceivePoItemInput {
  @ApiProperty()
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  quantityReceived: number;
}

export class ReceivePoDto {
  @ApiProperty({ type: [ReceivePoItemInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivePoItemInput)
  items: ReceivePoItemInput[];
}
