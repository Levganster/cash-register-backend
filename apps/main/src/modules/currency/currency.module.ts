import { Module } from '@nestjs/common';
import { CurrencyModule as LibCurrencyModule } from '@app/currency';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [LibCurrencyModule],
  controllers: [CurrencyController],
})
export class CurrencyModule {}
