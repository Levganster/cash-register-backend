import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma';
import { CurrencyBalanceModule } from '@app/currency-balance';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [PrismaModule, CurrencyBalanceModule],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionModule {}
