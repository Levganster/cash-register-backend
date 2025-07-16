import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class CurrencyBalanceBaseDto {
  @ApiProperty({
    description: 'ID баланса',
    example: 'uuid',
  })
  @IsString()
  balanceId: string;

  @ApiProperty({
    description: 'ID валюты',
    example: 'uuid',
  })
  @IsString()
  currencyId: string;

  @ApiProperty({
    description: 'Сумма в минимальных единицах валюты',
    example: 10000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  amount: number;
}
