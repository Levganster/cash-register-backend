import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { MediaService } from '@app/media';
import { MediaType } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import { BaseUser } from '@app/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly mediaService: MediaService,
    private readonly i18n: I18nService,
  ) {}

  async updateAvatar(id: string, avatarId: string): Promise<BaseUser> {
    const media = await this.mediaService.findOneById(avatarId);
    if (media.type !== MediaType.AVATAR) {
      throw new BadRequestException(this.i18n.t('errors.media.invalidType'));
    }
    return this.repository.updateAvatar(id, avatarId);
  }
}
