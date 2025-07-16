import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { SearchBaseDto } from '@app/common/base/search.dto';

export class CurrencyFiltersDto {
  @ApiProperty({
    description: 'Поиск по коду',
    required: false,
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Поиск по названию',
    required: false,
    example: 'Доллар',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Поиск по символу',
    required: false,
    example: '$',
  })
  @IsOptional()
  @IsString()
  symbol?: string;
}

export class CurrencySortsDto {
  @ApiProperty({
    description: 'Сортировка по коду',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  code?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Сортировка по названию',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  name?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Сортировка по дате создания',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  createdAt?: 'asc' | 'desc';
}

export class CurrencySearchDto extends SearchBaseDto<
  CurrencyFiltersDto,
  CurrencySortsDto
> {
  @ApiProperty({
    description: 'Фильтры поиска',
    required: false,
    type: CurrencyFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencyFiltersDto)
  filters?: CurrencyFiltersDto;

  @ApiProperty({
    description: 'Параметры сортировки',
    required: false,
    type: CurrencySortsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencySortsDto)
  sorts?: CurrencySortsDto;
}
