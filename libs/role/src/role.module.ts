import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { UsersModule } from '@app/users';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [RoleService, RoleRepository],
  exports: [RoleService],
  imports: [PrismaModule],
})
export class RoleModule {}
