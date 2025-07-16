import { Injectable } from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserSearchDto } from './dto/user.search.dto';
import { PrismaService } from '@app/prisma/prisma.service';
import { BaseRoleEnum } from '@app/common/constants/base-roles.enum';
import { USER_INCLUDE } from '@app/common/types/include/user.include';
import { User } from '@app/common';
import { mapPagination, mapSearch, mapSort } from '@app/prisma';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByTgId(tgId: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { tgId },
      include: USER_INCLUDE,
    });
  }

  async findOneById(id: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id },
      include: USER_INCLUDE,
    });
  }

  async create(dto: UserCreateDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...dto,
        role: {
          connect: {
            name: BaseRoleEnum.User,
          },
        },
      },
      include: USER_INCLUDE,
    });
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM users
        WHERE id = ${id}
      ) as exists
    `;

    return Boolean(result[0].exists);
  }

  async search(dto: UserSearchDto): Promise<User[]> {
    return this.prisma.user.findMany({
      where: mapSearch(dto.filters),
      orderBy: mapSort(dto.sorts),
      ...mapPagination(dto.pagination),
      include: USER_INCLUDE,
    });
  }

  async update(id: string, dto: UserUpdateDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      include: USER_INCLUDE,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
      include: USER_INCLUDE,
    });
  }
}
