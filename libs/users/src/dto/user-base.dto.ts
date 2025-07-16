import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserBaseDto {
  @ApiProperty({
    description: 'Telegram ID',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  tgId: string;
}
