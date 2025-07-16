import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MediaCreateDto } from './dto/media.create.dto';
import { Media } from '@app/common/types/media';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: MediaCreateDto & { url: string }): Promise<Media> {
    return this.prisma.media.create({
      data: {
        url: data.url,
        type: data.type,
      },
    });
  }

  async delete(id: string): Promise<Media> {
    return this.prisma.media.delete({ where: { id } });
  }

  async findOneById(id: string): Promise<Media> {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.prisma.$queryRaw`
      SELECT EXISTS(
        SELECT 1 
        FROM "medias" 
        WHERE id = ${id}
      ) as exists
    `;

    return Boolean(result[0].exists);
  }
}
