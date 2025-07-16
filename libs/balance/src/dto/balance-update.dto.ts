import { PartialType } from '@nestjs/swagger';
import { BalanceBaseDto } from './balance-base.dto';

export class BalanceUpdateDto extends PartialType(BalanceBaseDto) {}
