import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsEnum } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  SETTLEMENT = 'SETTLEMENT',
}

export class TransactionBaseDto {
  @ApiProperty({
    description:
      'Тип транзакции: INCOME - пополнение (+amount), EXPENSE - расход (-amount), TRANSFER - перевод (-amount), SETTLEMENT - установка конкретной суммы (=amount) и очистка всех доходов и предыдущих установок',
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Сумма в минимальных единицах валюты',
    example: 10000,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  amount: number;

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
}
