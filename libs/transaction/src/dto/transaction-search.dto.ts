import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { SearchBaseDto } from '@app/common/base/search.dto';
import { TransactionType } from './transaction-base.dto';

export class TransactionFiltersDto {
  @ApiProperty({
    description: 'Тип транзакции',
    required: false,
    enum: TransactionType,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({
    description: 'ID баланса',
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  balanceId?: string;

  @ApiProperty({
    description: 'ID валюты',
    required: false,
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiProperty({
    description: 'Минимальная сумма',
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Максимальная сумма',
    required: false,
    example: 100000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAmount?: number;

  @ApiProperty({
    description: 'Дата начала периода',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Дата окончания периода',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export class TransactionSortsDto {
  @ApiProperty({
    description: 'Сортировка по сумме',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  amount?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Сортировка по дате создания',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  createdAt?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Сортировка по типу',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  type?: 'asc' | 'desc';
}

export class TransactionSearchDto extends SearchBaseDto<
  TransactionFiltersDto,
  TransactionSortsDto
> {
  @ApiProperty({
    description: 'Фильтры поиска',
    required: false,
    type: TransactionFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionFiltersDto)
  filters?: TransactionFiltersDto;

  @ApiProperty({
    description: 'Параметры сортировки',
    required: false,
    type: TransactionSortsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionSortsDto)
  sorts?: TransactionSortsDto;
}
