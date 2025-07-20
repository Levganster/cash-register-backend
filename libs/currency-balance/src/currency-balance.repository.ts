import { Injectable } from '@nestjs/common';
import { PrismaService, mapPagination, mapSort } from '@app/prisma';
import { CurrencyBalanceCreateDto } from './dto/currency-balance-create.dto';
import { CurrencyBalanceUpdateDto } from './dto/currency-balance-update.dto';
import { CurrencyBalanceSearchDto } from './dto/currency-balance-search.dto';

@Injectable()
export class CurrencyBalanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CurrencyBalanceCreateDto) {
    return this.prisma.currencyBalance.create({
      data: dto,
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async update(id: string, dto: CurrencyBalanceUpdateDto) {
    return this.prisma.currencyBalance.update({
      where: { id },
      data: dto,
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.currencyBalance.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.currencyBalance.findUnique({
      where: { id },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async findByBalanceAndCurrency(balanceId: string, currencyId: string) {
    return this.prisma.currencyBalance.findUnique({
      where: {
        balanceId_currencyId: {
          balanceId,
          currencyId,
        },
      },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async search(dto: CurrencyBalanceSearchDto) {
    const where: any = {};

    if (dto.filters?.balanceId) {
      where.balanceId = dto.filters.balanceId;
    }

    if (dto.filters?.currencyId) {
      where.currencyId = dto.filters.currencyId;
    }

    if (dto.filters?.minAmount !== undefined) {
      where.amount = { ...where.amount, gte: dto.filters.minAmount };
    }

    if (dto.filters?.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: dto.filters.maxAmount };
    }

    return this.prisma.currencyBalance.findMany({
      where,
      orderBy: mapSort(dto.sorts || {}),
      ...mapPagination(dto.pagination),
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async count(dto: CurrencyBalanceSearchDto) {
    const where: any = {};

    if (dto.filters?.balanceId) {
      where.balanceId = dto.filters.balanceId;
    }

    if (dto.filters?.currencyId) {
      where.currencyId = dto.filters.currencyId;
    }

    if (dto.filters?.minAmount !== undefined) {
      where.amount = { ...where.amount, gte: dto.filters.minAmount };
    }

    if (dto.filters?.maxAmount !== undefined) {
      where.amount = { ...where.amount, lte: dto.filters.maxAmount };
    }

    return this.prisma.currencyBalance.count({
      where,
    });
  }

  async existsById(id: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM currency_balances WHERE id = ${id}
      ) as exists
    `;
    return Boolean(result[0].exists);
  }

  async existsByBalanceAndCurrency(
    balanceId: string,
    currencyId: string,
    excludeId?: string,
  ) {
    const where: any = {
      balanceId,
      currencyId,
    };

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    const result = await this.prisma.currencyBalance.findUnique({
      where: {
        balanceId_currencyId: {
          balanceId,
          currencyId,
        },
      },
      select: { id: true },
    });

    return Boolean(result);
  }

  async updateAmount(balanceId: string, currencyId: string, amount: bigint) {
    return this.prisma.currencyBalance.update({
      where: {
        balanceId_currencyId: {
          balanceId,
          currencyId,
        },
      },
      data: { amount },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async incrementAmount(balanceId: string, currencyId: string, amount: bigint) {
    return this.prisma.currencyBalance.update({
      where: {
        balanceId_currencyId: {
          balanceId,
          currencyId,
        },
      },
      data: {
        amount: {
          increment: amount,
        },
      },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async decrementAmount(balanceId: string, currencyId: string, amount: bigint) {
    return this.prisma.currencyBalance.update({
      where: {
        balanceId_currencyId: {
          balanceId,
          currencyId,
        },
      },
      data: {
        amount: {
          decrement: amount,
        },
      },
      include: {
        balance: true,
        currency: true,
      },
    });
  }
}
