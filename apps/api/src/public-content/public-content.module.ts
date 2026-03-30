import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicContentController } from './public-content.controller';
import { Page, PageSchema } from '../cms/schemas/page.schema';
import { BlogPost, BlogPostSchema } from '../cms/schemas/blog-post.schema';
import { Category, CategorySchema } from '../cms/schemas/category.schema';
import { Author, AuthorSchema } from '../cms/schemas/author.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Author.name, schema: AuthorSchema },
    ]),
  ],
  controllers: [PublicContentController],
})
export class PublicContentModule {}
