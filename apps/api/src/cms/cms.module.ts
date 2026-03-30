import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './schemas/page.schema';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Media, MediaSchema } from './schemas/media.schema';
import { Author, AuthorSchema } from './schemas/author.schema';
import { SlugService } from './services/slug.service';
import { PagesService } from './services/pages.service';
import { BlogPostsService } from './services/blog-posts.service';
import { CategoriesService } from './services/categories.service';
import { MediaService } from './services/media.service';
import { AuthorsService } from './services/authors.service';
import { PagesController } from './controllers/pages.controller';
import { BlogPostsController } from './controllers/blog-posts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { MediaController } from './controllers/media.controller';
import { AuthorsController } from './controllers/authors.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Media.name, schema: MediaSchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
    AuthModule,
  ],
  controllers: [
    PagesController,
    BlogPostsController,
    CategoriesController,
    MediaController,
    AuthorsController,
  ],
  providers: [
    SlugService,
    PagesService,
    BlogPostsService,
    CategoriesService,
    MediaService,
    AuthorsService,
  ],
  exports: [PagesService, BlogPostsService, CategoriesService, MediaService],
})
export class CmsModule {}
