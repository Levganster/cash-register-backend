import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/auth.guard';
import { PermissionGuard } from '@app/common/guards/permission.guard';
import { HasPermissions } from '@app/common/decorators/permissions.decorator';
import { PermissionEnum } from '@app/common/constants/permission.enum';
import {
  TransactionService,
  TransactionCreateDto,
  TransactionUpdateDto,
  TransactionSearchDto,
} from '@app/transaction';

@Controller('transaction')
@ApiTags('Transaction')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HasPermissions(PermissionEnum.TransactionCreate)
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция создана' })
  async create(@Body() dto: TransactionCreateDto) {
    return this.transactionService.create(dto);
  }

  @Post('search')
  @HasPermissions(PermissionEnum.TransactionSearch)
  @ApiOperation({ summary: 'Поиск транзакций' })
  @ApiResponse({ status: 200, description: 'Список транзакций' })
  async search(@Body() dto: TransactionSearchDto) {
    return this.transactionService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.TransactionGet)
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена' })
  async findById(@Param('id') id: string) {
    return this.transactionService.findById(id);
  }

  @Get('statistics/balance/:balanceId')
  @HasPermissions(PermissionEnum.TransactionStatistics)
  @ApiOperation({ summary: 'Получить статистику по балансу' })
  @ApiResponse({ status: 200, description: 'Статистика получена' })
  async getBalanceStatistics(@Param('balanceId') balanceId: string) {
    return this.transactionService.getBalanceStatistics(balanceId);
  }

  @Get('statistics/balance/:balanceId/currency/:currencyId')
  @HasPermissions(PermissionEnum.TransactionStatistics)
  @ApiOperation({ summary: 'Получить статистику по балансу и валюте' })
  @ApiResponse({ status: 200, description: 'Статистика получена' })
  async getBalanceStatisticsByCurrency(
    @Param('balanceId') balanceId: string,
    @Param('currencyId') currencyId: string,
  ) {
    return this.transactionService.getBalanceStatistics(balanceId, currencyId);
  }

  @Post('income')
  @HasPermissions(PermissionEnum.TransactionCreate)
  @ApiOperation({ summary: 'Создать транзакцию пополнения' })
  @ApiResponse({ status: 201, description: 'Транзакция пополнения создана' })
  async createIncome(
    @Body() dto: { balanceId: string; currencyId: string; amount: number },
  ) {
    return this.transactionService.createIncome(
      dto.balanceId,
      dto.currencyId,
      dto.amount,
    );
  }

  @Post('expense')
  @HasPermissions(PermissionEnum.TransactionCreate)
  @ApiOperation({ summary: 'Создать транзакцию расхода' })
  @ApiResponse({ status: 201, description: 'Транзакция расхода создана' })
  async createExpense(
    @Body() dto: { balanceId: string; currencyId: string; amount: number },
  ) {
    return this.transactionService.createExpense(
      dto.balanceId,
      dto.currencyId,
      dto.amount,
    );
  }

  @Post('transfer')
  @HasPermissions(PermissionEnum.TransactionCreate)
  @ApiOperation({ summary: 'Создать транзакцию перевода' })
  @ApiResponse({ status: 201, description: 'Транзакция перевода создана' })
  async createTransfer(
    @Body()
    dto: {
      fromBalanceId: string;
      toBalanceId: string;
      currencyId: string;
      amount: number;
    },
  ) {
    return this.transactionService.createTransfer(
      dto.fromBalanceId,
      dto.toBalanceId,
      dto.currencyId,
      dto.amount,
    );
  }

  @Put(':id')
  @HasPermissions(PermissionEnum.TransactionUpdate)
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена' })
  async update(@Param('id') id: string, @Body() dto: TransactionUpdateDto) {
    return this.transactionService.update(id, dto);
  }

  @Delete(':id')
  @HasPermissions(PermissionEnum.TransactionDelete)
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiResponse({ status: 200, description: 'Транзакция удалена' })
  async delete(@Param('id') id: string) {
    return this.transactionService.delete(id);
  }
}
