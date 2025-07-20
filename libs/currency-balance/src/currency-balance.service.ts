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
    return this.currencyBalanceRepository.findByBalanceAndCurrency(
      balanceId,
      currencyId,
    );
  }

  async search(dto: CurrencyBalanceSearchDto) {
    const data = await this.currencyBalanceRepository.search(dto);
    const count = await this.currencyBalanceRepository.count(dto);
    return {
      data,
      count,
    };
  }

  async updateAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount < 0) {
      throw new BadRequestException('Сумма не может быть отрицательной');
    }

    const bigIntAmount = BigInt(amount);

    // Проверяем существование баланса и создаем если нет
    const exists =
      await this.currencyBalanceRepository.existsByBalanceAndCurrency(
        balanceId,
        currencyId,
      );

    if (!exists) {
      // Создаем баланс с указанной суммой
      return this.currencyBalanceRepository.create({
        balanceId,
        currencyId,
        amount: bigIntAmount,
      });
    }

    return this.currencyBalanceRepository.updateAmount(
      balanceId,
      currencyId,
      bigIntAmount,
    );
  }

  async incrementAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    const bigIntAmount = BigInt(amount);

    // Проверяем существование баланса и создаем если нет
    const exists =
      await this.currencyBalanceRepository.existsByBalanceAndCurrency(
        balanceId,
        currencyId,
      );

    if (!exists) {
      // Создаем баланс с нулевой суммой
      await this.currencyBalanceRepository.create({
        balanceId,
        currencyId,
        amount: 0n,
      });
    }

    return this.currencyBalanceRepository.incrementAmount(
      balanceId,
      currencyId,
      bigIntAmount,
    );
  }

  async decrementAmount(balanceId: string, currencyId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Сумма должна быть положительной');
    }

    const bigIntAmount = BigInt(amount);

    let currencyBalance =
      await this.currencyBalanceRepository.findByBalanceAndCurrency(
        balanceId,
        currencyId,
      );

    if (!currencyBalance) {
      // Создаем баланс с нулевой суммой
      currencyBalance = await this.currencyBalanceRepository.create({
        balanceId,
        currencyId,
        amount: 0n,
      });
    }

    if (currencyBalance.amount < bigIntAmount) {
      throw new BadRequestException('Недостаточно средств');
    }

    return this.currencyBalanceRepository.decrementAmount(
      balanceId,
      currencyId,
      bigIntAmount,
    );
  }
}
