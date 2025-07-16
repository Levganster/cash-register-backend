import { PartialType } from '@nestjs/swagger';
import { TransactionBaseDto } from './transaction-base.dto';

export class TransactionUpdateDto extends PartialType(TransactionBaseDto) {}
