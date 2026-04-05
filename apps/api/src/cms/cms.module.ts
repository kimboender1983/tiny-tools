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
import { TechLogo, TechLogoSchema } from "./schemas/tech-logo.schema";
import { AffiliatesService } from "./services/affiliates.service";
import { AuthorsService } from "./services/authors.service";
import { BlogPostsService } from "./services/blog-posts.service";
import { CategoriesService } from "./services/categories.service";
import { MediaService } from "./services/media.service";
import { PagesService } from "./services/pages.service";
import { SlugService } from "./services/slug.service";
import { TechLogosController } from "./controllers/tech-logos.controller";
import { TechLogosService } from "./services/tech-logos.service";
import { TechLogosSeedService } from "./services/tech-logos-seed.service";

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
            { name: TechLogo.name, schema: TechLogoSchema },
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
        TechLogosController,
    ],
    providers: [
        SlugService,
        PagesService,
        BlogPostsService,
        CategoriesService,
        MediaService,
        AuthorsService,
        AffiliatesService,
        TechLogosService,
        TechLogosSeedService,
    ],
    exports: [PagesService, BlogPostsService, CategoriesService, MediaService, AffiliatesService, TechLogosService],
})
export class CmsModule {}
