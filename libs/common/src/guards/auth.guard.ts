import { AuthGuard } from '@nestjs/passport';
import { I18nContext } from 'nestjs-i18n';
import { UnauthorizedException } from '@nestjs/common';

export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      const i18n = I18nContext.current();
      throw new UnauthorizedException(i18n.t('errors.unauthorized'));
    }
    return user as T;
  }
}
