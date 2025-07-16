import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleModule as LibRoleModule } from '@app/role';

@Module({
  controllers: [RoleController],
  providers: [],
  imports: [LibRoleModule],
})
export class RoleModule {}
