import * as crypto from "node:crypto";
import { Controller, Get, NotFoundException, Param, Query, Req, Res } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Request, Response } from "express";
import { Model, SortOrder } from "mongoose";
import { Affiliate, AffiliateDocument } from "../cms/schemas/affiliate.schema";
import { AffiliateClick, AffiliateClickDocument } from "../cms/schemas/affiliate-click.schema";
import { Author, AuthorDocument } from "../cms/schemas/author.schema";
import { BlogPost, BlogPostDocument } from "../cms/schemas/blog-post.schema";
import { Category, CategoryDocument } from "../cms/schemas/category.schema";
import { Page, PageDocument } from "../cms/schemas/page.schema";
import { TechLogo, TechLogoDocument } from "../cms/schemas/tech-logo.schema";

@Controller("content")
export class PublicContentController {
    constructor(
        @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
        @InjectModel(BlogPost.name)
        private readonly blogPostModel: Model<BlogPostDocument>,
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>,
        @InjectModel(Author.name)
        private readonly authorModel: Model<AuthorDocument>,
        @InjectModel(Affiliate.name)
        private readonly affiliateModel: Model<AffiliateDocument>,
        @InjectModel(AffiliateClick.name)
        readonly _affiliateClickModel: Model<AffiliateClickDocument>,
        @InjectModel(TechLogo.name)
        private readonly techLogoModel: Model<TechLogoDocument>,
    ) {}

    private async resolvePostRefs(post: BlogPostDocument) {
        const obj = post.toJSON() as Record<string, unknown>;

        if (obj.author) {
            try {
                const author = await this.authorModel
                    .findById(String(obj.author))
                    .select("name avatar")
                    .lean()
                    .exec();
                if (author) obj.author = author;
            } catch {
                /* invalid id */
            }
        }

        if (obj.category) {
            try {
                const category = await this.categoryModel
                    .findById(String(obj.category))
                    .select("name slug icon")
                    .lean()
                    .exec();
                if (category) obj.category = category;
            } catch {
                /* invalid id */
            }
        }

        if (obj.techLogo) {
            try {
                const logo = await this.techLogoModel
                    .findById(String(obj.techLogo))
                    .select("name slug paths color bgColor viewBox fillRule")
                    .lean()
                    .exec();
                if (logo) obj.techLogo = logo;
            } catch {
                /* invalid id */
            }
        }

        return obj;
    }

    @Get("navigation")
    async getNavigation() {
        const pages = await this.pageModel
            .find({
                status: "published",
                navPlacement: { $in: ["header", "footer", "both"] },
            })
            .select("title slug template navPlacement navLabel footerGroup footerGroupOrder order")
            .sort({ order: 1 })
            .lean()
            .exec();

        const toNavItem = (p: Record<string, unknown>) => ({
            title: (p.navLabel || p.title) as string,
            slug: p.slug as string,
            path: p.template === "tool" ? `/tools/${p.slug}` : `/${p.slug}`,
            order: p.order as number | undefined,
        });

        const header = pages
            .filter((p) => p.navPlacement === "header" || p.navPlacement === "both")
            .map(toNavItem);

        // Group footer items by footerGroup
        const footerPages = pages.filter(
            (p) => p.navPlacement === "footer" || p.navPlacement === "both",
        );
        const groupMap = new Map<
            string,
            { title: string; order: number; items: ReturnType<typeof toNavItem>[] }
        >();

        for (const p of footerPages) {
            const group = (p.footerGroup || "Links") as string;
            if (!groupMap.has(group)) {
                groupMap.set(group, {
                    title: group,
                    order: (p.footerGroupOrder as number) ?? 99,
                    items: [],
                });
            }
            groupMap.get(group)?.items.push(toNavItem(p));
        }

        const footer = [...groupMap.values()].sort((a, b) => a.order - b.order);

        return { header, footer };
    }

    @Get("pages/:slug")
    async getPage(@Param("slug") slug: string) {
        const page = await this.pageModel.findOne({ slug, status: "published" }).exec();
        if (!page) {
            throw new NotFoundException(`Page "${slug}" not found`);
        }
        return page;
    }

    @Get("blog")
    async getBlogPosts(
        @Query("page") page = 1,
        @Query("limit") limit = 20,
        @Query("category") category?: string,
        @Query("tag") tag?: string,
        @Query("featured") featured?: string,
        @Query("featuredHomepage") featuredHomepage?: string,
        @Query("sortBy") sortBy = "publishedAt",
        @Query("sortOrder") sortOrder: "asc" | "desc" = "desc",
    ) {
        const filter: Record<string, unknown> = { status: "published" };
        if (category) filter.category = category;
        if (tag) filter.tags = tag;
        if (featured === "true") filter.featured = true;
        if (featuredHomepage === "true") filter.featuredHomepage = true;

        const sort: SortOrder = sortOrder === "asc" ? 1 : -1;

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

    @Get("blog/:slug")
    async getBlogPost(@Param("slug") slug: string) {
        const post = await this.blogPostModel.findOne({ slug, status: "published" }).exec();
        if (!post) {
            throw new NotFoundException(`Blog post "${slug}" not found`);
        }
        return this.resolvePostRefs(post);
    }

    @Get("categories")
    async getCategories() {
        return this.categoryModel.find().sort({ order: 1 }).exec();
    }

    @Get("sitemap")
    async getSitemap() {
        const [pages, posts, categories] = await Promise.all([
            this.pageModel
                .find({ status: "published" })
                .select("slug category updatedAt")
                .lean()
                .exec(),
            this.blogPostModel
                .find({ status: "published" })
                .select("slug category updatedAt")
                .lean()
                .exec(),
            this.categoryModel.find().select("slug updatedAt").lean().exec(),
        ]);

        // Build category ID→slug lookup
        const catMap = new Map(categories.map((c) => [String(c._id), c.slug]));

        return {
            pages: pages.map((p) => ({
                slug: p.slug,
                categorySlug: p.category ? catMap.get(String(p.category)) || undefined : undefined,
                updatedAt: p.updatedAt,
            })),
            blogPosts: posts.map((p) => ({
                slug: p.slug,
                categorySlug: p.category
                    ? catMap.get(String(p.category)) || "uncategorized"
                    : "uncategorized",
                updatedAt: p.updatedAt,
            })),
            categories: categories.map((c) => ({
                slug: c.slug,
                updatedAt: c.updatedAt,
            })),
        };
    }

    @Get("tech-logos")
    async getTechLogos() {
        return this.techLogoModel.find().sort({ name: 1 }).lean().exec();
    }

    @Get("tech-logos/:slug")
    async getTechLogoBySlug(@Param("slug") slug: string) {
        const logo = await this.techLogoModel.findOne({ slug }).lean().exec();
        if (!logo) {
            throw new NotFoundException(`Tech logo "${slug}" not found`);
        }
        return logo;
    }

    @Get("affiliates")
    async getActiveAffiliates() {
        return this.affiliateModel.find({ status: "active" }).select("slug name").lean().exec();
    }
}

@Controller("go")
export class AffiliateRedirectController {
    constructor(
        @InjectModel(Affiliate.name)
        private readonly affiliateModel: Model<AffiliateDocument>,
        @InjectModel(AffiliateClick.name)
        private readonly clickModel: Model<AffiliateClickDocument>,
    ) {}

    @Get(":slug")
    async redirect(@Param("slug") slug: string, @Req() req: Request, @Res() res: Response) {
        const affiliate = await this.affiliateModel.findOne({ slug, status: "active" }).exec();

        if (!affiliate) {
            throw new NotFoundException(`Affiliate "${slug}" not found`);
        }

        // Track click asynchronously
        const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip;
        const hashedIp = ip
            ? crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16)
            : undefined;

        this.clickModel
            .create({
                affiliate: affiliate._id,
                page: req.headers.referer || undefined,
                ip: hashedIp,
                userAgent: req.headers["user-agent"] || undefined,
            })
            .catch(() => {
                /* don't block redirect on tracking failure */
            });

        res.redirect(302, affiliate.url);
    }
}
