import { Module } from '@nestjs/common';
import { PrismaModule } from '@app/prisma';
import { CurrencyService } from './currency.service';
import { CurrencyRepository } from './currency.repository';

@Module({
  imports: [PrismaModule],
  providers: [CurrencyService, CurrencyRepository],
  exports: [CurrencyService],
})
export class CurrencyModule {}
