import { BaseRoleEnum } from '@app/common/constants/base-roles.enum';
import { RoleService } from '@app/role';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CanEditRoleGuard implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const roleId = request.params.id;

    const role = await this.roleService.findOneById(roleId);

    if (Object.values(BaseRoleEnum).includes(role.name as BaseRoleEnum)) {
      throw new ForbiddenException(
        this.i18n.t('errors.role.cannotEditBaseRole'),
      );
    }

    return true;
  }
}
