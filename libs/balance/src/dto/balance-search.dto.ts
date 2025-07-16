import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { SearchBaseDto } from '@app/common/base/search.dto';

export class BalanceFiltersDto {
  @ApiProperty({
    description: 'Поиск по названию',
    required: false,
    example: 'Основной',
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class BalanceSortsDto {
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

export class BalanceSearchDto extends SearchBaseDto<
  BalanceFiltersDto,
  BalanceSortsDto
> {
  @ApiProperty({
    description: 'Фильтры поиска',
    required: false,
    type: BalanceFiltersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BalanceFiltersDto)
  filters?: BalanceFiltersDto;

  @ApiProperty({
    description: 'Параметры сортировки',
    required: false,
    type: BalanceSortsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BalanceSortsDto)
  sorts?: BalanceSortsDto;
}
