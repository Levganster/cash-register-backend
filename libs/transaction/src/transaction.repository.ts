import { Injectable } from '@nestjs/common';
import { PrismaService, mapPagination, mapSort } from '@app/prisma';
import { TransactionCreateDto } from './dto/transaction-create.dto';
import { TransactionUpdateDto } from './dto/transaction-update.dto';
import { TransactionSearchDto } from './dto/transaction-search.dto';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: TransactionCreateDto) {
    return this.prisma.transaction.create({
      data: dto,
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async update(id: string, dto: TransactionUpdateDto) {
    return this.prisma.transaction.update({
      where: { id },
      data: dto,
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async search(dto: TransactionSearchDto) {
    const where: any = {};

    if (dto.filters?.type) {
      where.type = dto.filters.type;
    }

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

    if (dto.filters?.dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(dto.filters.dateFrom),
      };
    }

    if (dto.filters?.dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(dto.filters.dateTo),
      };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: mapSort(dto.sorts || { createdAt: 'desc' }),
      ...mapPagination(dto.pagination),
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async count(dto: TransactionSearchDto) {
    const where: any = {};

    if (dto.filters?.type) {
      where.type = dto.filters.type;
    }

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

    if (dto.filters?.dateFrom) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(dto.filters.dateFrom),
      };
    }

    if (dto.filters?.dateTo) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(dto.filters.dateTo),
      };
    }
    return this.prisma.transaction.count({
      where,
      orderBy: mapSort(dto.sorts || { createdAt: 'desc' }),
      ...mapPagination(dto.pagination),
    });
  }

  async existsById(id: string) {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM transactions WHERE id = ${id}
      ) as exists
    `;
    return Boolean(result[0].exists);
  }

  async getBalanceStatistics(balanceId: string, currencyId?: string) {
    const where: any = { balanceId };
    if (currencyId) {
      where.currencyId = currencyId;
    }

    const [income, expense, total] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      totalIncome: Number(income._sum.amount || 0n),
      totalExpense: Number(expense._sum.amount || 0n),
      totalTransactions: total,
      netAmount:
        Number(income._sum.amount || 0n) - Number(expense._sum.amount || 0n),
    };
  }

  async getTransactionsByDateRange(
    balanceId: string,
    currencyId: string,
    dateFrom: Date,
    dateTo: Date,
  ) {
    return this.prisma.transaction.findMany({
      where: {
        balanceId,
        currencyId,
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        balance: true,
        currency: true,
      },
    });
  }

  async deleteIncomeTransactions(balanceId: string, currencyId: string) {
    return this.prisma.transaction.deleteMany({
      where: {
        balanceId,
        currencyId,
        type: 'INCOME',
      },
    });
  }

  async deleteSettlementTransactions(balanceId: string, currencyId: string) {
    return this.prisma.transaction.deleteMany({
      where: {
        balanceId,
        currencyId,
        type: 'SETTLEMENT',
      },
    });
  }
}
