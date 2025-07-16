import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class MediaBaseDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;
}
