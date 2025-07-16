import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { SessionsRepository } from './sessions.repository';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly maxSessions: number;

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {
    this.maxSessions =
      this.configService.get<number>('MAX_SESSIONS_PER_USER') || 5;
  }

  async create(userId: string, refreshToken: string) {
    const sessions = await this.findManyByUserId(userId);

    if (sessions.length >= this.maxSessions) {
      this.logger.warn(`Пользователь ${userId} достиг лимита сессий`);
      const oldestSession = sessions.reduce((oldest, current) =>
        oldest.createdAt < current.createdAt ? oldest : current,
      );
      await this.deleteSession(oldestSession.refreshToken);
    }

    const session = await this.sessionsRepository.create(userId, refreshToken);
    this.logger.log(`Создана новая сессия для пользователя ${userId}`);
    return session;
  }

  async validateSession(refreshToken: string) {
    const session =
      await this.sessionsRepository.findByRefreshToken(refreshToken);

    if (!session) {
      this.logger.warn(`Сессия с токеном ${refreshToken} не найдена`);
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized'));
    }

    if (this.isSessionExpired(session.createdAt)) {
      this.logger.warn(`Сессия с токеном ${refreshToken} истекла`);
      await this.deleteSession(refreshToken);
      throw new UnauthorizedException(this.i18n.t('errors.sessionExpired'));
    }

    return session;
  }

  async deleteSession(refreshToken: string) {
    const result =
      await this.sessionsRepository.deleteByRefreshToken(refreshToken);
    this.logger.log(`Удалена сессия с токеном ${refreshToken}`);
    return result;
  }

  async deleteAllUserSessions(userId: string) {
    const result = await this.sessionsRepository.deleteAllUserSessions(userId);
    this.logger.log(`Удалены все сессии пользователя ${userId}`);
    return result;
  }

  async findManyByUserId(userId: string) {
    return this.sessionsRepository.findManyByUserId(userId);
  }

  private isSessionExpired(createdAt: Date): boolean {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
    return Date.now() - createdAt.getTime() > maxAge;
  }
}
