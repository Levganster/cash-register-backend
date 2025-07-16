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
  CurrencyBalanceService,
  CurrencyBalanceCreateDto,
  CurrencyBalanceUpdateDto,
  CurrencyBalanceSearchDto,
} from '@app/currency-balance';

@Controller('currency-balance')
@ApiTags('CurrencyBalance')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CurrencyBalanceController {
  constructor(
    private readonly currencyBalanceService: CurrencyBalanceService,
  ) {}

  @Post()
  @HasPermissions(PermissionEnum.CurrencyBalanceCreate)
  @ApiOperation({ summary: 'Создать баланс валюты' })
  @ApiResponse({ status: 201, description: 'Баланс валюты создан' })
  async create(@Body() dto: CurrencyBalanceCreateDto) {
    return this.currencyBalanceService.create(dto);
  }

  @Post('search')
  @HasPermissions(PermissionEnum.CurrencyBalanceSearch)
  @ApiOperation({ summary: 'Поиск балансов валют' })
  @ApiResponse({ status: 200, description: 'Список балансов валют' })
  async search(@Body() dto: CurrencyBalanceSearchDto) {
    return this.currencyBalanceService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.CurrencyBalanceGet)
  @ApiOperation({ summary: 'Получить баланс валюты по ID' })
  @ApiResponse({ status: 200, description: 'Баланс валюты найден' })
  async findById(@Param('id') id: string) {
    return this.currencyBalanceService.findById(id);
  }

  @Get('balance/:balanceId/currency/:currencyId')
  @HasPermissions(PermissionEnum.CurrencyBalanceGet)
  @ApiOperation({ summary: 'Получить баланс валюты по ID баланса и валюты' })
  @ApiResponse({ status: 200, description: 'Баланс валюты найден' })
  async findByBalanceAndCurrency(
    @Param('balanceId') balanceId: string,
    @Param('currencyId') currencyId: string,
  ) {
    return this.currencyBalanceService.findByBalanceAndCurrency(
      balanceId,
      currencyId,
    );
  }

  @Put(':id')
  @HasPermissions(PermissionEnum.CurrencyBalanceUpdate)
  @ApiOperation({ summary: 'Обновить баланс валюты' })
  @ApiResponse({ status: 200, description: 'Баланс валюты обновлен' })
  async update(@Param('id') id: string, @Body() dto: CurrencyBalanceUpdateDto) {
    return this.currencyBalanceService.update(id, dto);
  }

  @Put('balance/:balanceId/currency/:currencyId/amount/:amount')
  @HasPermissions(PermissionEnum.CurrencyBalanceUpdate)
  @ApiOperation({ summary: 'Установить сумму баланса валюты' })
  @ApiResponse({ status: 200, description: 'Сумма баланса валюты установлена' })
  async updateAmount(
    @Param('balanceId') balanceId: string,
    @Param('currencyId') currencyId: string,
    @Param('amount') amount: string,
  ) {
    return this.currencyBalanceService.updateAmount(
      balanceId,
      currencyId,
      parseInt(amount),
    );
  }

  @Put('balance/:balanceId/currency/:currencyId/increment/:amount')
  @HasPermissions(PermissionEnum.CurrencyBalanceUpdate)
  @ApiOperation({ summary: 'Увеличить сумму баланса валюты' })
  @ApiResponse({ status: 200, description: 'Сумма баланса валюты увеличена' })
  async incrementAmount(
    @Param('balanceId') balanceId: string,
    @Param('currencyId') currencyId: string,
    @Param('amount') amount: string,
  ) {
    return this.currencyBalanceService.incrementAmount(
      balanceId,
      currencyId,
      parseInt(amount),
    );
  }

  @Put('balance/:balanceId/currency/:currencyId/decrement/:amount')
  @HasPermissions(PermissionEnum.CurrencyBalanceUpdate)
  @ApiOperation({ summary: 'Уменьшить сумму баланса валюты' })
  @ApiResponse({ status: 200, description: 'Сумма баланса валюты уменьшена' })
  async decrementAmount(
    @Param('balanceId') balanceId: string,
    @Param('currencyId') currencyId: string,
    @Param('amount') amount: string,
  ) {
    return this.currencyBalanceService.decrementAmount(
      balanceId,
      currencyId,
      parseInt(amount),
    );
  }

  @Delete(':id')
  @HasPermissions(PermissionEnum.CurrencyBalanceDelete)
  @ApiOperation({ summary: 'Удалить баланс валюты' })
  @ApiResponse({ status: 200, description: 'Баланс валюты удален' })
  async delete(@Param('id') id: string) {
    return this.currencyBalanceService.delete(id);
  }
}
