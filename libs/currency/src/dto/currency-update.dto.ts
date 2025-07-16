import { PartialType } from '@nestjs/swagger';
import { CurrencyBaseDto } from './currency-base.dto';

export class CurrencyUpdateDto extends PartialType(CurrencyBaseDto) {}
