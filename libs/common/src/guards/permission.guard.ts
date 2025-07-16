import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { User } from '../types/user';
import { PermissionEnum } from '../constants/permission.enum';
import { PermissionService } from 'libs/permissions/src';
import { PERMISSION_SERVICE } from '../constants/providers.const';
import { JwtPayload } from '../types/jwt-payload';
import { Permission } from '../types/permission';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: PermissionService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.getRequiredPermissions(context);

    if (this.shouldSkipPermissionCheck(requiredPermissions)) {
      return true;
    }

    const payload = this.extractUserPayload(context);
    const permissions = await this.getUserPermissions(payload.roleId);

    await this.validatePermissions(permissions, requiredPermissions);

    return true;
  }

  private getRequiredPermissions(context: ExecutionContext): PermissionEnum[] {
    return this.reflector.getAllAndOverride<PermissionEnum[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private shouldSkipPermissionCheck(permissions: PermissionEnum[]): boolean {
    return !permissions || permissions.length === 0;
  }

  private extractUserPayload(context: ExecutionContext): JwtPayload {
    const { user } = context.switchToHttp().getRequest();
    return user;
  }

  private async getUserPermissions(roleId: string): Promise<Permission[]> {
    try {
      return await this.permissionService.findManyByRoleId(roleId);
    } catch (error) {
      throw new ForbiddenException(this.i18n.t('errors.accessDenied'));
    }
  }

  private async validatePermissions(
    userPermissions: Permission[],
    requiredPermissions: PermissionEnum[],
  ): Promise<void> {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.some((p) => p.name === permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(this.i18n.t('errors.accessDenied'));
    }
  }
}
