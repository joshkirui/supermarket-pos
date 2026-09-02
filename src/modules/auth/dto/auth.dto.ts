import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'cashier1' })
  @IsString()
  username: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @MinLength(4)
  pin: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    role: string;
    branchId: string;
    permissions: string[];
  };
}
