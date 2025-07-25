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
  BalanceService,
  BalanceCreateDto,
  BalanceUpdateDto,
  BalanceSearchDto,
} from '@app/balance';

@Controller('balance')
@ApiTags('Balance')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post()
  @HasPermissions(PermissionEnum.BalanceCreate)
  @ApiOperation({ summary: 'Создать баланс' })
  @ApiResponse({ status: 201, description: 'Баланс создан' })
  async create(@Body() dto: BalanceCreateDto) {
    return this.balanceService.create(dto);
  }

  @Post('search')
  @HasPermissions(PermissionEnum.BalanceSearch)
  @ApiOperation({ summary: 'Поиск балансов' })
  @ApiResponse({ status: 200, description: 'Список балансов' })
  async search(@Body() dto: BalanceSearchDto) {
    return this.balanceService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.BalanceGet)
  @ApiOperation({ summary: 'Получить баланс по ID' })
  @ApiResponse({ status: 200, description: 'Баланс найден' })
  async findById(@Param('id') id: string) {
    return this.balanceService.findById(id);
  }

  @Put(':id')
  @HasPermissions(PermissionEnum.BalanceUpdate)
  @ApiOperation({ summary: 'Обновить баланс' })
  @ApiResponse({ status: 200, description: 'Баланс обновлен' })
  async update(@Param('id') id: string, @Body() dto: BalanceUpdateDto) {
    return this.balanceService.update(id, dto);
  }

  @Delete(':id')
  @HasPermissions(PermissionEnum.BalanceDelete)
  @ApiOperation({ summary: 'Удалить баланс' })
  @ApiResponse({ status: 200, description: 'Баланс удален' })
  async delete(@Param('id') id: string) {
    return this.balanceService.delete(id);
  }

  @Post(':id/reset')
  @HasPermissions(PermissionEnum.BalanceUpdate)
  @ApiOperation({ summary: 'Сбросить баланс (удалить все транзакции и обнулить сумму)' })
  @ApiResponse({ status: 200, description: 'Баланс сброшен' })
  async reset(@Param('id') id: string) {
    return this.balanceService.reset(id);
  }
}
