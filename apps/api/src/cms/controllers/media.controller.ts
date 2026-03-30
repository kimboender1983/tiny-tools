import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { MediaService } from '../services/media.service';

@Controller('cms/media')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (
        _req: unknown,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        const allowed = /^(image|video|application\/pdf)/;
        if (allowed.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Unsupported file type'), false);
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { alt?: string; caption?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.mediaService.create({
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
      size: file.size,
      alt: body.alt,
      caption: body.caption,
    });
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.mediaService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { alt?: string; caption?: string },
  ) {
    return this.mediaService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.mediaService.delete(id);
  }
}
