import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKeyGuard, RequireApiKeyPermission } from "../auth/guards/api-key.guard";
import { BlogPost, BlogPostDocument } from "../cms/schemas/blog-post.schema";
import { SlugService } from "../cms/services/slug.service";
import { CreateBlogApiDto } from "./dto/create-blog-api.dto";

@ApiTags("Blog API")
@ApiBearerAuth("api-key")
@Controller("api/v1")
@UseGuards(ApiKeyGuard)
export class ApiBlogController {
    constructor(
        @InjectModel(BlogPost.name)
        private readonly blogPostModel: Model<BlogPostDocument>,
        private readonly slugService: SlugService,
    ) {}

    @Post("blog")
    @HttpCode(HttpStatus.CREATED)
    @RequireApiKeyPermission("blog:create")
    @ApiOperation({ summary: "Create a blog post", description: "Creates a new blog post. Requires API key with blog:create permission." })
    @ApiBody({ type: CreateBlogApiDto })
    @ApiResponse({ status: 201, description: "Blog post created successfully" })
    @ApiResponse({ status: 401, description: "Invalid or missing API key" })
    async createBlogPost(@Body() dto: CreateBlogApiDto) {
        const slug = dto.slug
            ? await this.slugService.ensureUnique(
                  this.slugService.generateSlug(dto.slug),
                  this.blogPostModel,
              )
            : await this.slugService.ensureUnique(
                  this.slugService.generateSlug(dto.title),
                  this.blogPostModel,
              );

        const wordCount = dto.content.trim().split(/\s+/).filter(Boolean).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        const post = new this.blogPostModel({
            title: dto.title,
            slug,
            content: dto.content,
            excerpt: dto.excerpt,
            coverImage: dto.coverImage,
            category: dto.category,
            tags: dto.tags,
            status: dto.status || "draft",
            author: dto.author,
            techLogo: dto.techLogo,
            techLogoColor: dto.techLogoColor,
            techLogoBgColor: dto.techLogoBgColor,
            techLogoBgColorTo: dto.techLogoBgColorTo,
            techLogoPickboxColor: dto.techLogoPickboxColor,
            techLogoTitleColor: dto.techLogoTitleColor,
            affiliateCta: dto.affiliateCta,
            seo: dto.seo || {},
            faq: dto.faq,
            readingTime,
            publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : dto.status === "published" ? new Date() : undefined,
        });

        const saved = await post.save();

        return {
            success: true,
            post: {
                _id: saved._id,
                title: saved.title,
                slug: saved.slug,
                status: saved.status,
                readingTime: saved.readingTime,
                publishedAt: saved.publishedAt,
                createdAt: saved.createdAt,
            },
        };
    }

    @Get("blog")
    @RequireApiKeyPermission("blog:create")
    @ApiOperation({ summary: "List blog posts", description: "Returns all blog posts (title, slug, status, tags, publishedAt). Use to check for duplicates before creating." })
    async listBlogPosts(
        @Query("status") status?: string,
        @Query("limit") limit = 50,
    ) {
        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;

        const posts = await this.blogPostModel
            .find(filter)
            .select("title slug status tags category publishedAt createdAt")
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();

        return { posts, total: posts.length };
    }

    @Get("blog/schema")
    @RequireApiKeyPermission("blog:create")
    @ApiOperation({ summary: "Get blog post schema", description: "Returns the JSON Schema for the CreateBlogPost DTO. Use this to discover all accepted fields dynamically." })
    async getSchema() {
        // Dynamically extract schema from the Swagger metadata on the DTO
        const metadata = Reflect.getMetadata("swagger/apiModelProperties", CreateBlogApiDto.prototype) || {};
        const properties: Record<string, unknown> = {};
        const required: string[] = [];

        // Get all property keys from the DTO prototype metadata
        const keys = Reflect.getMetadata("swagger/apiModelPropertiesArray", CreateBlogApiDto.prototype) || [];

        for (const rawKey of keys) {
            const key = rawKey.replace(":", "");
            const meta = Reflect.getMetadata("swagger/apiModelProperties", CreateBlogApiDto.prototype, key);
            if (!meta) continue;

            const prop: Record<string, unknown> = {
                type: meta.type?.name?.toLowerCase() || (meta.isArray ? "array" : "string"),
                description: meta.description,
            };
            if (meta.example !== undefined) prop.example = meta.example;
            if (meta.enum) prop.enum = meta.enum;
            if (meta.default !== undefined) prop.default = meta.default;
            if (meta.required) required.push(key);

            properties[key] = prop;
        }

        return {
            title: "CreateBlogPost",
            description: "Schema for creating a blog post via the API. All fields with their types, descriptions, and examples.",
            required: ["title", "content", "excerpt"],
            properties,
            authentication: "Bearer token in Authorization header: 'Authorization: Bearer pb_xxxx...'",
            endpoints: {
                create: "POST /api/v1/blog",
                schema: "GET /api/v1/blog/schema (this endpoint)",
                categories: "GET /content/categories (public, no auth)",
                techLogos: "GET /content/tech-logos (public, no auth)",
                swaggerUI: "GET /docs (full Swagger UI)",
                swaggerJSON: "GET /docs-json (OpenAPI spec)",
            },
        };
    }
}
