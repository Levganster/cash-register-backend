import { Module } from '@nestjs/common';
import { CurrencyBalanceModule as LibCurrencyBalanceModule } from '@app/currency-balance';
import { CurrencyBalanceController } from './currency-balance.controller';

@Module({
  imports: [LibCurrencyBalanceModule],
  controllers: [CurrencyBalanceController],
})
export class CurrencyBalanceModule {}
