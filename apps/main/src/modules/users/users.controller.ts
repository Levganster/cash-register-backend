import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/auth.guard';
import { DecodeUser } from '@app/common/decorators/decode-user.decorator';
import { UsersService as LibUsersService } from '@app/users';
import { RemovePasswordInterceptor } from '@app/common/interceptors/password.interceptor';
import { User } from '@app/common';
import { UsersService } from './users.service';
import { UpdateAvatarDto } from './dto/avatar.update.dto';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(RemovePasswordInterceptor)
export class UsersController {
  constructor(
    private readonly libService: LibUsersService,
    private readonly service: UsersService,
  ) {}

  @Get('me')
  async me(@DecodeUser() user: User) {
    return user;
  }

  @Patch('me/avatar')
  async updateAvatar(@DecodeUser() user: User, @Body() body: UpdateAvatarDto) {
    return this.service.updateAvatar(user.id, body.avatarId);
  }
}
