import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { MediaType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { MediaRepository } from './media.repository';
import { I18nService } from 'nestjs-i18n';
import { Readable } from 'stream';
import { Media } from '@app/common/types/media';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MediaService {
  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService,
    private readonly repository: MediaRepository,
    private readonly i18n: I18nService,
  ) {}

  async findOneByKey(key: string): Promise<Readable> {
    try {
      const media = await this.s3.getObject({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: key,
      });
      return media.Body as Readable;
    } catch (error) {
      throw new NotFoundException(this.i18n.t('errors.media.notFound'));
    }
  }

  async findOneById(id: string): Promise<Media> {
    const media = await this.repository.findOneById(id);
    if (!media) {
      throw new NotFoundException(this.i18n.t('errors.media.notFound'));
    }
    return media;
  }

  async ensureExistsById(id: string): Promise<void> {
    const exists = await this.repository.existsById(id);
    if (!exists) {
      throw new NotFoundException(this.i18n.t('errors.media.notFound'));
    }
  }

  async delete(id: string): Promise<Media> {
    await this.ensureExistsById(id);
    const media = await this.repository.delete(id);
    await this.deleteObject(media.url);
    return media;
  }

  async upload(file: Express.Multer.File, type: MediaType): Promise<Media> {
    const url = uuidv4();
    const key = `${type}-${url}`;

    try {
      await this.s3.putObject({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      const media = await this.repository.create({
        url: key,
        type,
      });

      return media;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.deleteObject({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: key,
      });
    } catch (error) {
      throw new NotFoundException(this.i18n.t('errors.media.notFound'));
    }
  }

  async getPresignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: key,
        ResponseContentType: 'image/jpeg',
      });
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      throw new NotFoundException(this.i18n.t('errors.media.notFound'));
    }
  }
}
