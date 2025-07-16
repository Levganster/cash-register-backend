import { PermissionModule } from '@app/permissions';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule } from 'nestjs-i18n';
import { AcceptLanguageResolver } from 'nestjs-i18n';
import config from '../../config/config';
import { TokenModule } from '@app/token';
import { RoleModule } from '../role/role.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule as LibUsersModule } from '@app/users';
import { PermissionModule as LibPermissionModule } from '@app/permissions';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, PermissionGuard } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      fallbacks: {
        'ru-*': 'ru',
        'en-*': 'en',
      },
      loaderOptions: {
        path: `./libs/i18n/`,
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('CACHE_TTL'), // milliseconds
      }),
    }),
    PermissionModule,
    TokenModule,
    RoleModule,
    PermissionsModule,
    LibUsersModule,
    LibPermissionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
