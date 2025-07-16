import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CurrencyBalanceRepository } from './currency-balance.repository';
import { CurrencyBalanceCreateDto } from './dto/currency-balance-create.dto';
import { CurrencyBalanceUpdateDto } from './dto/currency-balance-update.dto';
import { CurrencyBalanceSearchDto } from './dto/currency-balance-search.dto';

@Injectable()
export class CurrencyBalanceService {
  constructor(
    private readonly currencyBalanceRepository: CurrencyBalanceRepository,
  ) {}

  async create(dto: CurrencyBalanceCreateDto) {
    const exists =
      await this.currencyBalanceRepository.existsByBalanceAndCurrency(
        dto.balanceId,
        dto.currencyId,
      );
    if (exists) {
      throw new ConflictException('Баланс для данной валюты уже существует');
    }

    return this.currencyBalanceRepository.create(dto);
  }

  async update(id: string, dto: CurrencyBalanceUpdateDto) {
    const exists = await this.currencyBalanceRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return this.currencyBalanceRepository.update(id, dto);
  }

  async delete(id: string) {
    const exists = await this.currencyBalanceRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return this.currencyBalanceRepository.delete(id);
  }

  async findById(id: string) {
    const currencyBalance = await this.currencyBalanceRepository.findById(id);
    if (!currencyBalance) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return currencyBalance;
  }

  async findByBalanceAndCurrency(balanceId: string, currencyId: string) {
    const currencyBalance =
      await this.currencyBalanceRepository.findByBalanceAndCurrency(
        balanceId,
        currencyId,
      );
    if (!currencyBalance) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return currencyBalance;
  }

  async search(dto: CurrencyBalanceSearchDto) {
    return this.currencyBalanceRepository.search(dto);
  }

  async updateAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount < 0) {
      throw new BadRequestException('Сумма не может быть отрицательной');
    }

    const exists =
      await this.currencyBalanceRepository.existsByBalanceAndCurrency(
        balanceId,
        currencyId,
      );
    if (!exists) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return this.currencyBalanceRepository.updateAmount(
      balanceId,
      currencyId,
      amount,
    );
  }

  async incrementAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    const exists =
      await this.currencyBalanceRepository.existsByBalanceAndCurrency(
        balanceId,
        currencyId,
      );
    if (!exists) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    return this.currencyBalanceRepository.incrementAmount(
      balanceId,
      currencyId,
      amount,
    );
  }

  async decrementAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    const currencyBalance =
      await this.currencyBalanceRepository.findByBalanceAndCurrency(
        balanceId,
        currencyId,
      );
    if (!currencyBalance) {
      throw new NotFoundException('Баланс валюты не найден');
    }

    if (currencyBalance.amount < amount) {
      throw new BadRequestException('Недостаточно средств');
    }

    return this.currencyBalanceRepository.decrementAmount(
      balanceId,
      currencyId,
      amount,
    );
  }
}
