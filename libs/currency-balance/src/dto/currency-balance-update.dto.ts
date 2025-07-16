import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';

export class CurrencyBalanceUpdateDto {
  @ApiProperty({
    description: 'Новая сумма в минимальных единицах валюты',
    example: 15000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;
}
