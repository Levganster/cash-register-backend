import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsRepository } from './sessions.repository';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
