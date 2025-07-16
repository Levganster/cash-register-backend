import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma';
import { CurrencyBalanceService } from './currency-balance.service';
import { CurrencyBalanceRepository } from './currency-balance.repository';

@Module({
  imports: [PrismaModule],
  providers: [CurrencyBalanceService, CurrencyBalanceRepository],
  exports: [CurrencyBalanceService],
})
export class CurrencyBalanceModule {}
