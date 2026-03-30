import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { Page, PageDocument } from '../cms/schemas/page.schema';
import { BlogPost, BlogPostDocument } from '../cms/schemas/blog-post.schema';
import {
  Category,
  CategoryDocument,
} from '../cms/schemas/category.schema';
import { Author, AuthorDocument } from '../cms/schemas/author.schema';

@Controller('content')
export class PublicContentController {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
    @InjectModel(BlogPost.name)
    private readonly blogPostModel: Model<BlogPostDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
  ) {}

  private async resolvePostRefs(post: BlogPostDocument) {
    const obj = post.toJSON() as Record<string, unknown>;

    if (obj.author) {
      try {
        const author = await this.authorModel
          .findById(String(obj.author))
          .select('name avatar')
          .lean()
          .exec();
        if (author) obj.author = author;
      } catch { /* invalid id */ }
    }

    if (obj.category) {
      try {
        const category = await this.categoryModel
          .findById(String(obj.category))
          .select('name slug icon')
          .lean()
          .exec();
        if (category) obj.category = category;
      } catch { /* invalid id */ }
    }

    return obj;
  }

  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string) {
    const page = await this.pageModel
      .findOne({ slug, status: 'published' })
      .exec();
    if (!page) {
      throw new NotFoundException(`Page "${slug}" not found`);
    }
    return page;
  }

  @Get('blog')
  async getBlogPosts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('featured') featured?: string,
    @Query('sortBy') sortBy = 'publishedAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const filter: Record<string, unknown> = { status: 'published' };
    if (category) filter['category'] = category;
    if (tag) filter['tags'] = tag;
    if (featured === 'true') filter['featured'] = true;

    const sort: SortOrder = sortOrder === 'asc' ? 1 : -1;

    const [rawItems, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ [sortBy]: sort })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    const items = await Promise.all(rawItems.map((p) => this.resolvePostRefs(p)));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('blog/:slug')
  async getBlogPost(@Param('slug') slug: string) {
    const post = await this.blogPostModel
      .findOne({ slug, status: 'published' })
      .exec();
    if (!post) {
      throw new NotFoundException(`Blog post "${slug}" not found`);
    }
    return this.resolvePostRefs(post);
  }

  @Get('categories')
  async getCategories() {
    return this.categoryModel.find().sort({ order: 1 }).exec();
  }

  @Get('sitemap')
  async getSitemap() {
    const [pages, posts, categories] = await Promise.all([
      this.pageModel
        .find({ status: 'published' })
        .select('slug updatedAt')
        .lean()
        .exec(),
      this.blogPostModel
        .find({ status: 'published' })
        .select('slug category updatedAt')
        .lean()
        .exec(),
      this.categoryModel.find().select('slug updatedAt').lean().exec(),
    ]);

    // Build category ID→slug lookup
    const catMap = new Map(categories.map((c) => [String(c._id), c.slug]));

    return {
      pages: pages.map((p) => ({
        slug: p.slug,
        updatedAt: p.updatedAt,
      })),
      blogPosts: posts.map((p) => ({
        slug: p.slug,
        categorySlug: p.category ? (catMap.get(String(p.category)) || 'uncategorized') : 'uncategorized',
        updatedAt: p.updatedAt,
      })),
      categories: categories.map((c) => ({
        slug: c.slug,
        updatedAt: c.updatedAt,
      })),
    };
  }
}
