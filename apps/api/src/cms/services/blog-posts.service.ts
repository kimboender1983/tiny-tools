import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder, Types } from 'mongoose';
import { BlogPost, BlogPostDocument } from '../schemas/blog-post.schema';
import { CreateBlogPostDto } from '../dto/create-blog-post.dto';
import { UpdateBlogPostDto } from '../dto/update-blog-post.dto';
import { QueryFilterDto } from '../dto/query-filter.dto';
import { SlugService } from './slug.service';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectModel(BlogPost.name)
    private readonly blogPostModel: Model<BlogPostDocument>,
    private readonly slugService: SlugService,
  ) {}

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(' ').filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  async create(dto: CreateBlogPostDto): Promise<BlogPostDocument> {
    const slug = dto.slug
      ? this.slugService.generateSlug(dto.slug)
      : this.slugService.generateSlug(dto.title);

    const uniqueSlug = await this.slugService.ensureUnique(
      slug,
      this.blogPostModel,
    );

    const readingTime = this.calculateReadingTime(dto.content);

    const data: Record<string, unknown> = {
      ...dto,
      slug: uniqueSlug,
      readingTime,
      status: dto.status || 'draft',
    };

    if (dto.status === 'published' && !dto.publishedAt) {
      data['publishedAt'] = new Date();
    }

    const post = new this.blogPostModel(data);
    return post.save();
  }

  async findAll(query: QueryFilterDto) {
    const filter: FilterQuery<BlogPost> = {};

    if (query.status) {
      filter.status = query.status;
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder: SortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(idOrSlug: string): Promise<BlogPostDocument> {
    const post = Types.ObjectId.isValid(idOrSlug)
      ? await this.blogPostModel.findById(idOrSlug).exec()
      : await this.blogPostModel.findOne({ slug: idOrSlug }).exec();
    if (!post) {
      throw new NotFoundException(`Blog post "${idOrSlug}" not found`);
    }
    return post;
  }

  private async resolveId(idOrSlug: string): Promise<string> {
    if (Types.ObjectId.isValid(idOrSlug)) return idOrSlug;
    const post = await this.blogPostModel.findOne({ slug: idOrSlug }).select('_id').exec();
    if (!post) {
      throw new NotFoundException(`Blog post "${idOrSlug}" not found`);
    }
    return post._id.toString();
  }

  async findBySlug(slug: string): Promise<BlogPostDocument> {
    const post = await this.blogPostModel.findOne({ slug }).exec();
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return post;
  }

  async update(
    idOrSlug: string,
    dto: UpdateBlogPostDto,
  ): Promise<BlogPostDocument> {
    const id = await this.resolveId(idOrSlug);
    const existing = await this.findById(id);

    if (dto.slug && dto.slug !== existing.slug) {
      const newSlug = this.slugService.generateSlug(dto.slug);
      dto.slug = await this.slugService.ensureUnique(
        newSlug,
        this.blogPostModel,
        id,
      );
    }

    if (dto.content) {
      (dto as Record<string, unknown>)['readingTime'] =
        this.calculateReadingTime(dto.content);
    }

    if (
      dto.status === 'published' &&
      existing.status !== 'published' &&
      !dto.publishedAt
    ) {
      (dto as Record<string, unknown>)['publishedAt'] = new Date();
    }

    const updated = await this.blogPostModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }
    return updated;
  }

  async toggleFeatured(idOrSlug: string): Promise<BlogPostDocument> {
    const id = await this.resolveId(idOrSlug);
    const post = await this.findById(id);
    const updated = await this.blogPostModel
      .findByIdAndUpdate(
        id,
        { $set: { featured: !post.featured } },
        { new: true },
      )
      .exec();
    if (!updated) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }
    return updated;
  }

  async delete(idOrSlug: string): Promise<void> {
    const id = await this.resolveId(idOrSlug);
    const result = await this.blogPostModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }
  }
}
