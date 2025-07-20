import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BalanceRepository } from './balance.repository';
import { BalanceCreateDto } from './dto/balance-create.dto';
import { BalanceUpdateDto } from './dto/balance-update.dto';
import { BalanceSearchDto } from './dto/balance-search.dto';

@Injectable()
export class BalanceService {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  async create(dto: BalanceCreateDto) {
    const exists = await this.balanceRepository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException('Баланс с таким названием уже существует');
    }

    return this.balanceRepository.create(dto);
  }

  async update(id: string, dto: BalanceUpdateDto) {
    const exists = await this.balanceRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Баланс не найден');
    }

    if (dto.name) {
      const nameExists = await this.balanceRepository.existsByName(
        dto.name,
        id,
      );
      if (nameExists) {
        throw new ConflictException('Баланс с таким названием уже существует');
      }
    }

    return this.balanceRepository.update(id, dto);
  }

  async delete(id: string) {
    const exists = await this.balanceRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Баланс не найден');
    }

    return this.balanceRepository.delete(id);
  }

  async findById(id: string) {
    const balance = await this.balanceRepository.findById(id);
    if (!balance) {
      throw new NotFoundException('Баланс не найден');
    }

    return balance;
  }

  async search(dto: BalanceSearchDto) {
    const data = await this.balanceRepository.search(dto);
    const count = await this.balanceRepository.count(dto);
    return {
      data,
      count,
    };
  }
}
