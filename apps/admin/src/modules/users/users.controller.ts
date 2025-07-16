import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { HasPermissions } from '@app/common';
import { PermissionEnum } from '@app/common';
import { UsersService } from '@app/users';
import { UserCreateDto, UserUpdateDto, UserSearchDto } from '@app/users';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HasPermissions(PermissionEnum.UserCreate)
  @ApiOperation({ summary: 'Создать пользователя' })
  async create(@Body() dto: UserCreateDto) {
    return this.usersService.create(dto);
  }

  @Post('search')
  @HasPermissions(PermissionEnum.UserSearch)
  @ApiOperation({ summary: 'Поиск пользователей' })
  async search(@Body() dto: UserSearchDto) {
    return this.usersService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.UserGet)
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  async findOneById(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @HasPermissions(PermissionEnum.UserUpdate)
  @ApiOperation({ summary: 'Обновить пользователя' })
  async update(@Param('id') id: string, @Body() dto: UserUpdateDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HasPermissions(PermissionEnum.UserDelete)
  @ApiOperation({ summary: 'Удалить пользователя' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
