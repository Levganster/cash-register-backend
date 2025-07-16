import { Module } from '@nestjs/common';
import { PermissionController } from './permissions.controller';

@Module({
  controllers: [PermissionController],
})
export class PermissionsModule {}
