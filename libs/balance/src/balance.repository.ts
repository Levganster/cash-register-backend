import { Injectable } from '@nestjs/common';
import { PrismaService, mapPagination, mapSearch, mapSort } from '@app/prisma';
import { BalanceCreateDto } from './dto/balance-create.dto';
import { BalanceUpdateDto } from './dto/balance-update.dto';
import { BalanceSearchDto } from './dto/balance-search.dto';

@Injectable()
export class BalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: BalanceCreateDto) {
    return this.prisma.balance.create({
      data: dto,
      include: {
        currencyBalances: {
          include: {
            currency: true,
          },
        },
        transactions: {
          include: {
            currency: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  async update(id: string, dto: BalanceUpdateDto) {
    return this.prisma.balance.update({
      where: { id },
      data: dto,
      include: {
        currencyBalances: {
          include: {
            currency: true,
          },
        },
        transactions: {
          include: {
            currency: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.balance.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.balance.findUnique({
      where: { id },
      include: {
        currencyBalances: {
          include: {
            currency: true,
          },
        },
        transactions: {
          include: {
            currency: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  async search(dto: BalanceSearchDto) {
    return this.prisma.balance.findMany({
      where: mapSearch(dto.filters || {}),
      orderBy: mapSort(dto.sorts || {}),
      ...mapPagination(dto.pagination),
      include: {
        currencyBalances: {
          include: {
            currency: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  async existsById(id: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM balances WHERE id = ${id}
      ) as exists
    `;
    return Boolean(result[0].exists);
  }

  async existsByName(name: string, excludeId?: string) {
    const where = excludeId ? { name, NOT: { id: excludeId } } : { name };

    const result = await this.prisma.balance.findUnique({
      where,
      select: { id: true },
    });

    return Boolean(result);
  }
}
