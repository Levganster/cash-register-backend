import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionRepository } from './transaction.repository';
import { CurrencyBalanceService } from '@app/currency-balance';
import { TransactionCreateDto } from './dto/transaction-create.dto';
import { TransactionUpdateDto } from './dto/transaction-update.dto';
import { TransactionSearchDto } from './dto/transaction-search.dto';
import { TransactionType } from './dto/transaction-base.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly currencyBalanceService: CurrencyBalanceService,
  ) {}

  async create(dto: TransactionCreateDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    const transaction = await this.transactionRepository.create(dto);

    // Обновляем баланс в зависимости от типа транзакции
    if (dto.type === TransactionType.INCOME) {
      await this.currencyBalanceService.incrementAmount(
        dto.balanceId,
        dto.currencyId,
        dto.amount,
      );
    } else if (
      dto.type === TransactionType.EXPENSE ||
      dto.type === TransactionType.TRANSFER
    ) {
      await this.currencyBalanceService.decrementAmount(
        dto.balanceId,
        dto.currencyId,
        dto.amount,
      );
    }

    return transaction;
  }

  async update(id: string, dto: TransactionUpdateDto) {
    const exists = await this.transactionRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Транзакция не найдена');
    }

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    // Получаем старую транзакцию для отката изменений
    const oldTransaction = await this.transactionRepository.findById(id);

    // Откатываем старую транзакцию
    if (oldTransaction.type === TransactionType.INCOME) {
      await this.currencyBalanceService.decrementAmount(
        oldTransaction.balanceId,
        oldTransaction.currencyId,
        Number(oldTransaction.amount),
      );
    } else if (
      oldTransaction.type === TransactionType.EXPENSE ||
      oldTransaction.type === TransactionType.TRANSFER
    ) {
      await this.currencyBalanceService.incrementAmount(
        oldTransaction.balanceId,
        oldTransaction.currencyId,
        Number(oldTransaction.amount),
      );
    }

    // Обновляем транзакцию
    const updatedTransaction = await this.transactionRepository.update(id, dto);

    // Применяем новую транзакцию
    const finalTransaction = { ...oldTransaction, ...dto };
    if (finalTransaction.type === TransactionType.INCOME) {
      await this.currencyBalanceService.incrementAmount(
        finalTransaction.balanceId,
        finalTransaction.currencyId,
        Number(finalTransaction.amount),
      );
    } else if (
      finalTransaction.type === TransactionType.EXPENSE ||
      finalTransaction.type === TransactionType.TRANSFER
    ) {
      await this.currencyBalanceService.decrementAmount(
        finalTransaction.balanceId,
        finalTransaction.currencyId,
        Number(finalTransaction.amount),
      );
    }

    return updatedTransaction;
  }

  async delete(id: string) {
    const exists = await this.transactionRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Транзакция не найдена');
    }

    // Получаем транзакцию для отката баланса
    const transaction = await this.transactionRepository.findById(id);

    // Откатываем транзакцию из баланса
    if (transaction.type === TransactionType.INCOME) {
      await this.currencyBalanceService.decrementAmount(
        transaction.balanceId,
        transaction.currencyId,
        Number(transaction.amount),
      );
    } else if (
      transaction.type === TransactionType.EXPENSE ||
      transaction.type === TransactionType.TRANSFER
    ) {
      await this.currencyBalanceService.incrementAmount(
        transaction.balanceId,
        transaction.currencyId,
        Number(transaction.amount),
      );
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
    const search = await this.transactionRepository.search(dto);
    const count = await this.transactionRepository.count(dto);
    return {
      data: search,
      count,
    };
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


}
