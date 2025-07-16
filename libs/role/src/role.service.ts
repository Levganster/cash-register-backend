import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PermissionService } from '@app/permissions';
import { RoleRepository } from './role.repository';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { PERMISSION_SERVICE } from '@app/common/constants/providers.const';
import { RoleSearchDto } from './dto/role-search.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly i18n: I18nService,
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: PermissionService,
  ) {}

  async delete(id: string) {
    await this.ensureExistsById(id);
    return this.roleRepository.delete(id);
  }

  async search(dto: RoleSearchDto) {
    const [roles, count] = await Promise.all([
      this.roleRepository.search(dto),
      this.roleRepository.count(dto),
    ]);

    return {
      data: roles,
      count,
    };
  }

  async update(id: string, dto: RoleUpdateDto) {
    if (dto.permissions.length) {
      await Promise.all(
        dto.permissions.map((permission) =>
          this.permissionService.ensureExistsById(permission),
        ),
      );
    }
    await this.ensureExistsById(id);
    await this.ensureExistsByName(dto.name, id);
    return this.roleRepository.update(id, dto);
  }

  async create(dto: RoleCreateDto) {
    if (dto.permissions.length) {
      await Promise.all(
        dto.permissions.map((permission) =>
          this.permissionService.ensureExistsById(permission),
        ),
      );
    }
    await this.ensureExistsByName(dto.name);
    return this.roleRepository.create(dto);
  }

  async findOneById(id: string) {
    const role = await this.roleRepository.findOneById(id);
    if (!role) {
      throw new NotFoundException(this.i18n.t('errors.role.notFound'));
    }
    return role;
  }

  async ensureExistsById(id: string) {
    const exists = await this.roleRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException(this.i18n.t('errors.role.notFound'));
    }
  }

  async ensureExistsByName(name: string, id?: string) {
    const exists = await this.roleRepository.existsByName(name, id);
    if (exists) {
      throw new ConflictException(this.i18n.t('errors.role.alreadyExists'));
    }
  }
}
