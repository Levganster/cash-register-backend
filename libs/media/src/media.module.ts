import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
