import { Controller, Get, Param, Inject, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionEnum } from '@app/common/constants/permission.enum';
import { HasPermissions } from '@app/common/decorators/permissions.decorator';
import { PERMISSION_SERVICE } from '@app/common/constants/providers.const';
import { PermissionService } from '@app/permissions';
import { PermissionSearchDto } from '@app/permissions/dto/permission-search.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: PermissionService,
  ) {}

  @Post('search')
  @HasPermissions(PermissionEnum.PermissionSearch)
  async search(@Body() dto: PermissionSearchDto) {
    return this.permissionService.search(dto);
  }

  @Get(':id')
  @HasPermissions(PermissionEnum.PermissionGet)
  async findOne(@Param('id') id: string) {
    return this.permissionService.findOneById(id);
  }
}
