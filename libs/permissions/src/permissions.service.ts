import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from './permissions.repository';
import { I18nService } from 'nestjs-i18n';
import { PermissionSearchDto } from './dto/permission-search.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Permission } from '@app/common/types/permission';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async search(dto: PermissionSearchDto) {
    const [permissions, count] = await Promise.all([
      this.permissionRepository.search(dto),
      this.permissionRepository.count(dto),
    ]);

    return {
      data: permissions,
      count,
    };
  }

  async findManyByRoleId(roleId: string): Promise<Permission[]> {
    let permissions = await this.cacheManager.get<Permission[]>(
      `permissions:${roleId}`,
    );
    if (permissions) {
      this.logger.log(`Права для роли ${roleId} найдены в кэше`);
      return permissions;
    }
    permissions = await this.permissionRepository.findManyByRoleId(roleId);
    if (!permissions.length) {
      this.logger.warn(`Права для роли ${roleId} не найдены`);
      throw new NotFoundException(this.i18n.t('errors.permission.notFound'));
    }
    this.logger.log(`Права для роли ${roleId} найдены в базе данных`);
    await this.cacheManager.set(
      `permissions:${roleId}`,
      permissions,
      1000 * 60, // one minute
    );
    return permissions;
  }

  async findOneById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOneById(id);
    if (!permission) {
      this.logger.warn(`Право ${id} не найдено`);
      throw new NotFoundException(this.i18n.t('errors.permission.notFound'));
    }
    this.logger.log(`Право ${permission.name} найдено`);
    return permission;
  }

  async ensureExistsById(id: string): Promise<void> {
    const exists = await this.permissionRepository.existsById(id);
    if (!exists) {
      this.logger.warn(`Право ${id} не найдено`);
      throw new NotFoundException(this.i18n.t('errors.permission.notFound'));
    }
  }
}
