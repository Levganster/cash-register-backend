import { ApiProperty } from '@nestjs/swagger';
import { SearchBaseDto } from '@app/common/base/search.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UserFiltersDto {}

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
