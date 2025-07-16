import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { BaseUser } from '@app/common';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateAvatar(id: string, avatarId: string): Promise<BaseUser> {
    return this.prisma.user.update({
      where: { id },
      data: { avatarId },
    });
  }
}
