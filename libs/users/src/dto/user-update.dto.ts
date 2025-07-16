import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({
    description: 'Telegram ID',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  tgId?: string;

  @ApiProperty({
    description: 'Role ID',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleId?: string;
}
