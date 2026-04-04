import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { AffiliatesController } from "./controllers/affiliates.controller";
import { AuthorsController } from "./controllers/authors.controller";
import { BlogPostsController } from "./controllers/blog-posts.controller";
import { CategoriesController } from "./controllers/categories.controller";
import { MediaController } from "./controllers/media.controller";
import { PagesController } from "./controllers/pages.controller";
import { Affiliate, AffiliateSchema } from "./schemas/affiliate.schema";
import { AffiliateClick, AffiliateClickSchema } from "./schemas/affiliate-click.schema";
import { Author, AuthorSchema } from "./schemas/author.schema";
import { BlogPost, BlogPostSchema } from "./schemas/blog-post.schema";
import { Category, CategorySchema } from "./schemas/category.schema";
import { Media, MediaSchema } from "./schemas/media.schema";
import { Page, PageSchema } from "./schemas/page.schema";
import { AffiliatesService } from "./services/affiliates.service";
import { AuthorsService } from "./services/authors.service";
import { BlogPostsService } from "./services/blog-posts.service";
import { CategoriesService } from "./services/categories.service";
import { MediaService } from "./services/media.service";
import { PagesService } from "./services/pages.service";
import { SlugService } from "./services/slug.service";

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
