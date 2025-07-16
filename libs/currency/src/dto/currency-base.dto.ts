import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CurrencyBaseDto {
  @ApiProperty({
    description: 'Код валюты',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  code: string;

  @ApiProperty({
    description: 'Название валюты',
    example: 'Доллар США',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Символ валюты',
    example: '$',
    minLength: 1,
    maxLength: 5,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5)
  symbol: string;
}
