import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { UserBaseDto } from './user-base.dto';
import { SearchBaseDto } from '@app/common/base/search.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class UserFiltersDto extends PartialType(
  OmitType(UserBaseDto, ['password']),
) {
  @ApiProperty()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  organizationId?: string;
}

export class UserSortDto {}

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
