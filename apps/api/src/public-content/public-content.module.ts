import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Affiliate, AffiliateSchema } from "../cms/schemas/affiliate.schema";
import { AffiliateClick, AffiliateClickSchema } from "../cms/schemas/affiliate-click.schema";
import { Author, AuthorSchema } from "../cms/schemas/author.schema";
import { BlogPost, BlogPostSchema } from "../cms/schemas/blog-post.schema";
import { Category, CategorySchema } from "../cms/schemas/category.schema";
import { Page, PageSchema } from "../cms/schemas/page.schema";
import { TechLogo, TechLogoSchema } from "../cms/schemas/tech-logo.schema";
import { ApiKey, ApiKeySchema } from "../cms/schemas/api-key.schema";
import { SlugService } from "../cms/services/slug.service";
import { AffiliateRedirectController, PublicContentController } from "./public-content.controller";
import { ApiBlogController } from "./api-blog.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Page.name, schema: PageSchema },
            { name: BlogPost.name, schema: BlogPostSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Author.name, schema: AuthorSchema },
            { name: Affiliate.name, schema: AffiliateSchema },
            { name: AffiliateClick.name, schema: AffiliateClickSchema },
            { name: TechLogo.name, schema: TechLogoSchema },
            { name: ApiKey.name, schema: ApiKeySchema },
        ]),
    ],
    controllers: [PublicContentController, AffiliateRedirectController, ApiBlogController],
    providers: [SlugService],
})
export class PublicContentModule {}
