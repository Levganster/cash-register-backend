import { Module } from '@nestjs/common';
import { BalanceModule as LibBalanceModule } from '@app/balance';
import { BalanceController } from './balance.controller';

@Module({
  imports: [LibBalanceModule],
  controllers: [BalanceController],
})
export class BalanceModule {}
