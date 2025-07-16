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
  CurrencyService,
  CurrencyCreateDto,
  CurrencyUpdateDto,
  CurrencySearchDto,
} from '@app/currency';

@Controller('currency')
@ApiTags('Currency')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @HasPermissions(PermissionEnum.CurrencyCreate)
  @ApiOperation({ summary: 'Создать валюту' })
  @ApiResponse({ status: 201, description: 'Валюта создана' })
  async create(@Body() dto: CurrencyCreateDto) {
    return this.currencyService.create(dto);
  }

  @Post('search')
  @HasPermissions(PermissionEnum.CurrencySearch)
  @ApiOperation({ summary: 'Поиск валют' })
  @ApiResponse({ status: 200, description: 'Список валют' })
  async search(@Body() dto: CurrencySearchDto) {
    return this.currencyService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.CurrencyGet)
  @ApiOperation({ summary: 'Получить валюту по ID' })
  @ApiResponse({ status: 200, description: 'Валюта найдена' })
  async findById(@Param('id') id: string) {
    return this.currencyService.findById(id);
  }

  @Put(':id')
  @HasPermissions(PermissionEnum.CurrencyUpdate)
  @ApiOperation({ summary: 'Обновить валюту' })
  @ApiResponse({ status: 200, description: 'Валюта обновлена' })
  async update(@Param('id') id: string, @Body() dto: CurrencyUpdateDto) {
    return this.currencyService.update(id, dto);
  }

  @Delete(':id')
  @HasPermissions(PermissionEnum.CurrencyDelete)
  @ApiOperation({ summary: 'Удалить валюту' })
  @ApiResponse({ status: 200, description: 'Валюта удалена' })
  async delete(@Param('id') id: string) {
    return this.currencyService.delete(id);
  }
}
