import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CurrencyRepository } from './currency.repository';
import { CurrencyCreateDto } from './dto/currency-create.dto';
import { CurrencyUpdateDto } from './dto/currency-update.dto';
import { CurrencySearchDto } from './dto/currency-search.dto';

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async create(dto: CurrencyCreateDto) {
    const exists = await this.currencyRepository.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException('Валюта с таким кодом уже существует');
    }

    return this.currencyRepository.create(dto);
  }

  async update(id: string, dto: CurrencyUpdateDto) {
    const exists = await this.currencyRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Валюта не найдена');
    }

    if (dto.code) {
      const codeExists = await this.currencyRepository.existsByCode(
        dto.code,
        id,
      );
      if (codeExists) {
        throw new ConflictException('Валюта с таким кодом уже существует');
      }
    }

    return this.currencyRepository.update(id, dto);
  }

  async delete(id: string) {
    const exists = await this.currencyRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException('Валюта не найдена');
    }

    return this.currencyRepository.delete(id);
  }

  async findById(id: string) {
    const currency = await this.currencyRepository.findById(id);
    if (!currency) {
      throw new NotFoundException('Валюта не найдена');
    }

    return currency;
  }

  async search(dto: CurrencySearchDto) {
    const data = await this.currencyRepository.search(dto);
    const count = await this.currencyRepository.count(dto);
    return {
      data,
      count,
    };
  }
}
