import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, refreshToken: string) {
    return this.prisma.session.create({
      data: {
        userId,
        refreshToken,
      },
    });
  }

  async findManyByUserId(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return this.prisma.session.findFirst({
      where: { refreshToken },
      include: { user: true },
    });
  }

  async deleteByRefreshToken(refreshToken: string) {
    return this.prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async deleteAllUserSessions(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}
