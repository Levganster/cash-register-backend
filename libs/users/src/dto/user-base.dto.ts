import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class UserBaseDto {
  @ApiProperty({ default: 'string@gmail.com' })
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
