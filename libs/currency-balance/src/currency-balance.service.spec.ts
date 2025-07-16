import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyBalanceService } from './currency-balance.service';

describe('CurrencyBalanceService', () => {
  let service: CurrencyBalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrencyBalanceService],
    }).compile();

    service = module.get<CurrencyBalanceService>(CurrencyBalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
