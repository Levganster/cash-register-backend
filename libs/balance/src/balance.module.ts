import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma';
import { BalanceService } from './balance.service';
import { BalanceRepository } from './balance.repository';

@Module({
  imports: [PrismaModule],
  providers: [BalanceService, BalanceRepository],
  exports: [BalanceService],
})
export class BalanceModule {}
