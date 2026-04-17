import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { AffiliatesController } from "./controllers/affiliates.controller";
import { BlogAnalyticsController } from "./controllers/blog-analytics.controller";
import { AuthorsController } from "./controllers/authors.controller";
import { BlogPostsController } from "./controllers/blog-posts.controller";
import {
    BlogWriterController,
    SchedulerConfigController,
    TopicQueueController,
    WritingTonesController,
} from "./controllers/blog-writer.controller";
import { CategoriesController } from "./controllers/categories.controller";
import { MediaController } from "./controllers/media.controller";
import { PagesController } from "./controllers/pages.controller";
import { TechLogosController } from "./controllers/tech-logos.controller";
import { ApiKeysController } from "./controllers/api-keys.controller";
import { Affiliate, AffiliateSchema } from "./schemas/affiliate.schema";
import { AffiliateClick, AffiliateClickSchema } from "./schemas/affiliate-click.schema";
import { ApiKey, ApiKeySchema } from "./schemas/api-key.schema";
import { Author, AuthorSchema } from "./schemas/author.schema";
import { BlogFeedback, BlogFeedbackSchema } from "./schemas/blog-feedback.schema";
import { BlogGeneration, BlogGenerationSchema } from "./schemas/blog-generation.schema";
import { BlogPost, BlogPostSchema } from "./schemas/blog-post.schema";
import { Category, CategorySchema } from "./schemas/category.schema";
import { Media, MediaSchema } from "./schemas/media.schema";
import { Page, PageSchema } from "./schemas/page.schema";
import { SchedulerConfig, SchedulerConfigSchema } from "./schemas/scheduler-config.schema";
import { TechLogo, TechLogoSchema } from "./schemas/tech-logo.schema";
import { TopicQueue, TopicQueueSchema } from "./schemas/topic-queue.schema";
import { WritingTone, WritingToneSchema } from "./schemas/writing-tone.schema";
import { AffiliatesService } from "./services/affiliates.service";
import { ApiKeysService } from "./services/api-keys.service";
import { AuthorsService } from "./services/authors.service";
import { BlogPostsService } from "./services/blog-posts.service";
import { BlogSchedulerService } from "./services/blog-scheduler.service";
import { BlogWriterService } from "./services/blog-writer.service";
import { CategoriesService } from "./services/categories.service";
import { MediaService } from "./services/media.service";
import { PagesService } from "./services/pages.service";
import { SlugService } from "./services/slug.service";
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
            { name: ApiKey.name, schema: ApiKeySchema },
            { name: WritingTone.name, schema: WritingToneSchema },
            { name: TopicQueue.name, schema: TopicQueueSchema },
            { name: BlogGeneration.name, schema: BlogGenerationSchema },
            { name: SchedulerConfig.name, schema: SchedulerConfigSchema },
            { name: BlogFeedback.name, schema: BlogFeedbackSchema },
        ]),
        AuthModule,
    ],
    controllers: [
        PagesController,
        BlogPostsController,
        BlogAnalyticsController,
        CategoriesController,
        MediaController,
        AuthorsController,
        AffiliatesController,
        TechLogosController,
        ApiKeysController,
        BlogWriterController,
        WritingTonesController,
        TopicQueueController,
        SchedulerConfigController,
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
        ApiKeysService,
        BlogWriterService,
        BlogSchedulerService,
    ],
    exports: [PagesService, BlogPostsService, CategoriesService, MediaService, AffiliatesService, TechLogosService, ApiKeysService],
})
export class CmsModule {}
