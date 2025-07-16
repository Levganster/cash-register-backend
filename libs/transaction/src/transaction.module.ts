import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';

@Module({
  imports: [PrismaModule],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionModule {}
