import { Injectable } from '@nestjs/common';
import { PrismaService, mapPagination, mapSearch, mapSort } from '@app/prisma';
import { CurrencyCreateDto } from './dto/currency-create.dto';
import { CurrencyUpdateDto } from './dto/currency-update.dto';
import { CurrencySearchDto } from './dto/currency-search.dto';

@Injectable()
export class CurrencyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CurrencyCreateDto) {
    return this.prisma.currency.create({
      data: dto,
      include: {
        currencyBalances: {
          include: {
            balance: true,
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

  async update(id: string, dto: CurrencyUpdateDto) {
    return this.prisma.currency.update({
      where: { id },
      data: dto,
      include: {
        currencyBalances: {
          include: {
            balance: true,
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

  async delete(id: string) {
    return this.prisma.currency.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.currency.findUnique({
      where: { id },
      include: {
        currencyBalances: {
          include: {
            balance: true,
          },
        },
        transactions: {
          include: {
            balance: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  async search(dto: CurrencySearchDto) {
    return this.prisma.currency.findMany({
      where: mapSearch(dto.filters || {}),
      orderBy: mapSort(dto.sorts || {}),
      ...mapPagination(dto.pagination),
      include: {
        currencyBalances: {
          include: {
            balance: true,
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

  async count(dto: CurrencySearchDto) {
    return this.prisma.currency.count({
      where: mapSearch(dto.filters || {}),
    });
  }

  async existsById(id: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM currencies WHERE id = ${id}
      ) as exists
    `;
    return Boolean(result[0].exists);
  }

  async existsByCode(code: string, excludeId?: string) {
    const where = excludeId ? { code, NOT: { id: excludeId } } : { code };

    const result = await this.prisma.currency.findUnique({
      where,
      select: { id: true },
    });

    return Boolean(result);
  }
}
