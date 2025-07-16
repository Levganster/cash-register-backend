import { Module } from '@nestjs/common';
import { TransactionModule as LibTransactionModule } from '@app/transaction';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [LibTransactionModule],
  controllers: [TransactionController],
})
export class TransactionModule {}
