import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from '@app/token';
import { UsersService } from '@app/users';
import { PasswordService } from '@app/password';
import { Response } from 'express';
import { SessionsService } from '@app/sessions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly i18n: I18nService,
    private readonly sessionsService: SessionsService,
    private readonly configService: ConfigService,
  ) {}

  private async generateTokenPair(userId: string, roleId: string) {
    return {
      accessToken: await this.tokenService.generateAccessToken(userId, roleId),
      refreshToken: await this.tokenService.generateRefreshToken(
        userId,
        roleId,
      ),
    };
  }

  async setTokensCookie(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    await Promise.all(
      Object.entries(tokens).map(([name, token]) =>
        this.setTokenCookie(res, { token, name }),
      ),
    );
  }

  async signUp(dto: SignUpDto) {
    const user = await this.usersService.create(dto);
    this.logger.log(`Пользователь ${dto.email} зарегистрировался`);
    return this.generateTokenPair(user.id, user.roleId);
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findOneByEmail(dto.email);

    if (
      !(await this.passwordService.comparePassword({
        password: dto.password,
        hashedPassword: user.password,
      }))
    ) {
      this.logger.warn(`Неудачная попытка входа для ${dto.email}`);
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized'));
    }

    const tokens = await this.generateTokenPair(user.id, user.roleId);
    await this.sessionsService.create(user.id, tokens.refreshToken);

    this.logger.log(`Пользователь ${dto.email} успешно вошел в систему`);
    return tokens;
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized'));
    }

    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const session = await this.sessionsService.validateSession(refreshToken);

    await this.sessionsService.deleteSession(refreshToken);

    const tokens = await this.generateTokenPair(payload.id, payload.roleId);
    await this.sessionsService.create(payload.id, tokens.refreshToken);

    this.logger.log(`Обновлен токен для пользователя ${payload.id}`);
    return tokens;
  }

  async signOut(refreshToken: string, fullLogout: boolean = false) {
    if (!refreshToken) {
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized'));
    }

    const session = await this.sessionsService.validateSession(refreshToken);

    if (fullLogout) {
      await this.sessionsService.deleteAllUserSessions(session.userId);
      this.logger.log(`Пользователь ${session.userId} вышел из всех сессий`);
    } else {
      await this.sessionsService.deleteSession(refreshToken);
      this.logger.log(`Пользователь ${session.userId} вышел из текущей сессии`);
    }
  }

  private async setTokenCookie(
    res: Response,
    data: { token: string; name: string },
  ) {
    res.cookie(data.name, data.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
