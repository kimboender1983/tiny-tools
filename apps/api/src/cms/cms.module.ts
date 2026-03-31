import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Media, MediaSchema } from './schemas/media.schema';
import { Author, AuthorSchema } from './schemas/author.schema';
import { Affiliate, AffiliateSchema } from './schemas/affiliate.schema';
import { AffiliateClick, AffiliateClickSchema } from './schemas/affiliate-click.schema';
import { SlugService } from './services/slug.service';
import { PagesService } from './services/pages.service';
import { BlogPostsService } from './services/blog-posts.service';
import { CategoriesService } from './services/categories.service';
import { MediaService } from './services/media.service';
import { AuthorsService } from './services/authors.service';
import { AffiliatesService } from './services/affiliates.service';
import { PagesController } from './controllers/pages.controller';
import { BlogPostsController } from './controllers/blog-posts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { MediaController } from './controllers/media.controller';
import { AuthorsController } from './controllers/authors.controller';
import { AffiliatesController } from './controllers/affiliates.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Media.name, schema: MediaSchema },
      { name: Author.name, schema: AuthorSchema },
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: AffiliateClick.name, schema: AffiliateClickSchema },
    ]),
    AuthModule,
  ],
  controllers: [
    PagesController,
    BlogPostsController,
    CategoriesController,
    MediaController,
    AuthorsController,
    AffiliatesController,
  ],
  providers: [
    SlugService,
    PagesService,
    BlogPostsService,
    CategoriesService,
    MediaService,
    AuthorsService,
    AffiliatesService,
  ],
  exports: [PagesService, BlogPostsService, CategoriesService, MediaService, AffiliatesService],
})
export class CmsModule {}
