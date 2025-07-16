import { JwtPayload } from '@app/common/types/jwt-payload';
import { UsersService } from '@app/users';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.usersService.findOneById(payload.id);
      return user;
    } catch (error) {
      throw new UnauthorizedException(this.i18n.t('errors.unauthorized'));
    }
  }
}
