import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { PermissionSearchDto } from './dto/permission-search.dto';
import { mapPagination, mapSearch } from '@app/prisma';
import { mapSort } from '@app/prisma/map.sort';
import { Permission } from '@app/common/types/permission';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneById(id: string): Promise<Permission> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async search(dto: PermissionSearchDto): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: mapSearch(dto.filters),
      orderBy: mapSort(dto.sorts),
      ...mapPagination(dto.pagination),
    });
  }

  async count(dto: PermissionSearchDto): Promise<number> {
    return this.prisma.permission.count({
      where: mapSearch(dto.filters),
    });
  }

  async findManyByRoleId(roleId: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { rolePermissions: { some: { roleId } } },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM permissions
        WHERE id = ${id}
      ) as exists
    `;

    return Boolean(result[0].exists);
  }

  async existsMany(ids: string[]): Promise<boolean> {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM permissions
        WHERE id IN (${ids.map((id) => id).join(',')})
      ) as exists
    `;
    return Boolean(result[0].exists);
  }
}
