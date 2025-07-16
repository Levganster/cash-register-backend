import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { TransactionCreateDto } from './dto/transaction-create.dto';
import { TransactionUpdateDto } from './dto/transaction-update.dto';
import { TransactionSearchDto } from './dto/transaction-search.dto';
import { TransactionType } from './dto/transaction-base.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async create(dto: TransactionCreateDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    return this.transactionRepository.create(dto);
  }

  async update(id: string, dto: TransactionUpdateDto) {
    const exists = await this.transactionRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Транзакция не найдена');
    }

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    return this.transactionRepository.update(id, dto);
  }

  async delete(id: string) {
    const exists = await this.transactionRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return this.transactionRepository.delete(id);
  }

  async findById(id: string) {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  async search(dto: TransactionSearchDto) {
    if (dto.filters?.dateFrom && dto.filters?.dateTo) {
      const dateFrom = new Date(dto.filters.dateFrom);
      const dateTo = new Date(dto.filters.dateTo);

      if (dateFrom > dateTo) {
        throw new BadRequestException(
          'Дата начала не может быть больше даты окончания',
        );
      }
    }

    return this.transactionRepository.search(dto);
  }

  async getBalanceStatistics(balanceId: string, currencyId?: string) {
    return this.transactionRepository.getBalanceStatistics(
      balanceId,
      currencyId,
    );
  }

  async getTransactionsByDateRange(
    balanceId: string,
    currencyId: string,
    dateFrom: Date,
    dateTo: Date,
  ) {
    if (dateFrom > dateTo) {
      throw new BadRequestException(
        'Дата начала не может быть больше даты окончания',
      );
    }

    return this.transactionRepository.getTransactionsByDateRange(
      balanceId,
      currencyId,
      dateFrom,
      dateTo,
    );
  }

  async createIncome(balanceId: string, currencyId: string, amount: number) {
    return this.create({
      type: TransactionType.INCOME,
      amount,
      balanceId,
      currencyId,
    });
  }

  async createExpense(balanceId: string, currencyId: string, amount: number) {
    return this.create({
      type: TransactionType.EXPENSE,
      amount,
      balanceId,
      currencyId,
    });
  }

  async createTransfer(
    fromBalanceId: string,
    toBalanceId: string,
    currencyId: string,
    amount: number,
  ) {
    const [expenseTransaction, incomeTransaction] = await Promise.all([
      this.create({
        type: TransactionType.EXPENSE,
        amount,
        balanceId: fromBalanceId,
        currencyId,
      }),
      this.create({
        type: TransactionType.INCOME,
        amount,
        balanceId: toBalanceId,
        currencyId,
      }),
    ]);

    return {
      expenseTransaction,
      incomeTransaction,
    };
  }
}
