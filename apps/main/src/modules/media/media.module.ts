import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaModule as LibMediaModule } from '@app/media';

@Module({
  imports: [LibMediaModule],
  controllers: [MediaController],
})
export class MediaModule {}
