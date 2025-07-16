import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { RoleSearchDto } from './dto/role-search.dto';
import { mapPagination, mapSearch } from '@app/prisma';
import { mapSort } from '@app/prisma/map.sort';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async delete(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  async create(dto: RoleCreateDto) {
    return this.prisma.role.create({
      data: {
        name: dto.name,
        rolePermissions: dto.permissions.length
          ? {
              createMany: {
                data: dto.permissions.map((permission) => ({
                  permissionId: permission,
                })),
              },
            }
          : undefined,
      },
    });
  }

  async update(id: string, dto: RoleUpdateDto) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        rolePermissions: dto.permissions.length
          ? {
              deleteMany: {},
              createMany: {
                data: dto.permissions.map((permission) => ({
                  permissionId: permission,
                })),
              },
            }
          : undefined,
      },
    });
  }

  async findOneById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async search(dto: RoleSearchDto) {
    return this.prisma.role.findMany({
      where: mapSearch(dto.filters),
      orderBy: mapSort(dto.sorts),
      ...mapPagination(dto.pagination),
    });
  }

  async count(dto: RoleSearchDto) {
    return this.prisma.role.count({
      where: mapSearch(dto.filters),
    });
  }

  async existsById(id: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM roles
        WHERE id = ${id}
      ) as exists
    `;

    return Boolean(result[0].exists);
  }

  async existsByName(name: string, id?: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM roles
        WHERE name = ${name} AND id != ${id}
      ) as exists
    `;
    return Boolean(result[0].exists);
  }
}
