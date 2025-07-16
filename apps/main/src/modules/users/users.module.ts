import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { MediaModule } from '@app/media';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
})
export class UsersModule {}
