import { ApiProperty } from '@nestjs/swagger';
import { SearchBaseDto } from '@app/common/base/search.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { SortTypes } from '@app/common/constants/sort-types.enum';

export class UserFiltersDto {
  @ApiProperty({
    description: 'Telegram ID',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  tgId?: string;

  @ApiProperty({
    description: 'ID роли',
    example: 'uuid',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleId?: string;
}

export class UserSortDto {
  @ApiProperty({
    description: 'Сортировка по дате создания',
    enum: SortTypes,
    required: false,
  })
  @IsOptional()
  createdAt?: SortTypes;

  @ApiProperty({
    description: 'Сортировка по дате обновления',
    enum: SortTypes,
    required: false,
  })
  @IsOptional()
  updatedAt?: SortTypes;
}

export class UserSearchDto extends SearchBaseDto<UserFiltersDto, UserSortDto> {
  @ApiProperty({
    type: UserFiltersDto,
  })
  @ValidateNested()
  @Type(() => UserFiltersDto)
  filters?: UserFiltersDto;

  @ApiProperty({
    type: UserSortDto,
  })
  @ValidateNested()
  @Type(() => UserSortDto)
  sorts?: UserSortDto;
}
