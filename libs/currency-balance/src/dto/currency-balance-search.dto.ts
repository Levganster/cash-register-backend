import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { SearchBaseDto } from '@app/common/base/search.dto';

export class CurrencyBalanceFiltersDto {
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
}

export class CurrencyBalanceSortsDto {
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
}

export class CurrencyBalanceSearchDto extends SearchBaseDto<
  CurrencyBalanceFiltersDto,
  CurrencyBalanceSortsDto
> {
  @ApiProperty({
    description: 'Фильтры поиска',
    required: false,
    type: CurrencyBalanceFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencyBalanceFiltersDto)
  filters?: CurrencyBalanceFiltersDto;

  @ApiProperty({
    description: 'Параметры сортировки',
    required: false,
    type: CurrencyBalanceSortsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencyBalanceSortsDto)
  sorts?: CurrencyBalanceSortsDto;
}
