import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Media, MediaDocument } from '../schemas/media.schema';

@Injectable()
export class MediaService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  private readonly r2Configured: boolean;

  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
    private readonly configService: ConfigService,
  ) {
    const accountId = this.configService.get<string>('r2.accountId');
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey');
    this.bucketName = this.configService.get<string>('r2.bucketName') || 'tinytools';
    this.publicUrl = this.configService.get<string>('r2.publicUrl') || '';

    this.r2Configured = !!(accountId && accessKeyId && secretAccessKey && !accessKeyId.includes('<'));

    console.log('[MediaService] R2 config:', {
      accountId: accountId ? `${accountId.slice(0, 8)}...` : '(empty)',
      accessKeyId: accessKeyId ? `${accessKeyId.slice(0, 8)}...` : '(empty)',
      secretAccessKey: secretAccessKey ? '(set)' : '(empty)',
      bucketName: this.bucketName,
      publicUrl: this.publicUrl,
      r2Configured: this.r2Configured,
    });

    if (this.r2Configured) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: accessKeyId!,
          secretAccessKey: secretAccessKey!,
        },
      });
    } else {
      // Dummy client — uploads will be stored locally
      this.s3Client = null as unknown as S3Client;
    }
  }

  async create(data: {
    filename: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    caption?: string;
  }): Promise<MediaDocument> {
    const key = `media/${Date.now()}-${data.filename}`;
    let url: string;

    if (this.r2Configured) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: data.buffer,
          ContentType: data.mimeType,
        }),
      );
      url = `${this.publicUrl}/${key}`;
    } else {
      // Local fallback — store as data URI for dev (not for production)
      const base64 = data.buffer.toString('base64');
      url = `data:${data.mimeType};base64,${base64}`;
    }

    const media = new this.mediaModel({
      filename: data.filename,
      url,
      mimeType: data.mimeType,
      size: data.size,
      width: data.width,
      height: data.height,
      alt: data.alt,
      caption: data.caption,
    });
    return media.save();
  }

  async findAll(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.mediaModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.mediaModel.countDocuments().exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<MediaDocument> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }
    return media;
  }

  async getBuffer(id: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const media = await this.findById(id);

    // Data URI fallback (dev mode)
    if (media.url.startsWith('data:')) {
      const matches = media.url.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        return {
          buffer: Buffer.from(matches[2], 'base64'),
          mimeType: matches[1],
        };
      }
    }

    // Fetch from R2 via S3 client
    if (this.r2Configured && media.url.startsWith(this.publicUrl)) {
      const key = media.url.replace(`${this.publicUrl}/`, '');
      const response = await this.s3Client.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      const stream = response.Body;
      const chunks: Buffer[] = [];
      for await (const chunk of stream as AsyncIterable<Buffer>) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return {
        buffer: Buffer.concat(chunks),
        mimeType: media.mimeType,
      };
    }

    // Fallback: fetch via public URL
    const res = await fetch(media.url);
    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      mimeType: media.mimeType,
    };
  }

  async update(
    id: string,
    data: { alt?: string; caption?: string },
  ): Promise<MediaDocument> {
    const updated = await this.mediaModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }
    return updated;
  }

  async replace(
    id: string,
    data: {
      buffer: Buffer;
      mimeType: string;
      size: number;
      width?: number;
      height?: number;
    },
  ): Promise<MediaDocument> {
    const existing = await this.mediaModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }

    // Delete old file from R2 if applicable
    if (this.r2Configured && existing.url.startsWith(this.publicUrl)) {
      const oldKey = existing.url.replace(`${this.publicUrl}/`, '');
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: oldKey }),
      );
    }

    // Upload new file
    const key = `media/${Date.now()}-${existing.filename}`;
    let url: string;

    if (this.r2Configured) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: data.buffer,
          ContentType: data.mimeType,
        }),
      );
      url = `${this.publicUrl}/${key}`;
    } else {
      const base64 = data.buffer.toString('base64');
      url = `data:${data.mimeType};base64,${base64}`;
    }

    const updated = await this.mediaModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            url,
            mimeType: data.mimeType,
            size: data.size,
            width: data.width,
            height: data.height,
          },
        },
        { new: true },
      )
      .exec();

    return updated!;
  }

  async delete(id: string): Promise<void> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with id "${id}" not found`);
    }

    if (this.r2Configured && media.url.startsWith(this.publicUrl)) {
      const key = media.url.replace(`${this.publicUrl}/`, '');
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
  }
}
