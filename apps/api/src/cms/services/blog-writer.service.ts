import Anthropic from "@anthropic-ai/sdk";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Author, AuthorDocument } from "../schemas/author.schema";
import { BlogGeneration, BlogGenerationDocument } from "../schemas/blog-generation.schema";
import { BlogPost, BlogPostDocument } from "../schemas/blog-post.schema";
import { Category, CategoryDocument } from "../schemas/category.schema";
import { TechLogo, TechLogoDocument } from "../schemas/tech-logo.schema";
import { WritingTone, WritingToneDocument } from "../schemas/writing-tone.schema";
import { SlugService } from "./slug.service";

const DEFAULT_MODEL = "claude-sonnet-4-6";

interface RefineOptions {
    postId: string;
    prompt: string;
    model?: string;
}

export interface RefinedBlogPost {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
        focusKeyword?: string;
    };
    faq: Array<{ question: string; answer: string }>;
}

interface ExistingPostSnapshot {
    title: string;
    content: string;
    excerpt: string;
    tags?: string[];
    seo?: { metaTitle?: string; metaDescription?: string; focusKeyword?: string };
    faq?: Array<{ question: string; answer: string }>;
}

interface GenerateOptions {
    topic: string;
    toneId?: string;
    categoryId?: string;
    type?: string;
    model?: string;
    includeDiagrams?: boolean;
    includeCharts?: boolean;
    includePlaygrounds?: boolean;
    includeComparisonTables?: boolean;
}

interface ParsedBlogPost {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
    category: string;
    techLogo?: string;
    techLogoColor?: string;
    techLogoBgColor?: string;
    techLogoBgColorTo?: string;
    seo: {
        metaTitle: string;
        metaDescription: string;
        focusKeyword?: string;
    };
    faq: Array<{ question: string; answer: string }>;
}

@Injectable()
export class BlogWriterService {
    private readonly logger = new Logger(BlogWriterService.name);
    private client: Anthropic | null = null;

    constructor(
        @InjectModel(BlogPost.name) private readonly blogPostModel: Model<BlogPostDocument>,
        @InjectModel(BlogGeneration.name)
        private readonly generationModel: Model<BlogGenerationDocument>,
        @InjectModel(WritingTone.name) private readonly toneModel: Model<WritingToneDocument>,
        @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
        @InjectModel(TechLogo.name) private readonly techLogoModel: Model<TechLogoDocument>,
        @InjectModel(Author.name) private readonly authorModel: Model<AuthorDocument>,
        private readonly configService: ConfigService,
        private readonly slugService: SlugService,
    ) {}

    private getClient(): Anthropic {
        if (!this.client) {
            const apiKey = this.configService.get<string>("anthropicApiKey");
            if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
            this.client = new Anthropic({ apiKey });
        }
        return this.client;
    }

    async generate(options: GenerateOptions): Promise<{ postId: string; generationId: string }> {
        const startTime = Date.now();

        try {
            // 1. Get tone
            const tone = options.toneId
                ? await this.toneModel.findById(options.toneId).exec()
                : await this.toneModel.findOne({ isDefault: true }).exec();

            // 2. Get existing posts for duplicate check
            const existingPosts = await this.blogPostModel
                .find()
                .select("title slug tags")
                .lean()
                .exec();

            // 3. Get categories + tech logos + authors for context
            const [categories, techLogos, authors] = await Promise.all([
                this.categoryModel.find().select("name slug _id").lean().exec(),
                this.techLogoModel.find().select("name slug _id").lean().exec(),
                this.authorModel.find().select("name _id").lean().exec(),
            ]);

            // 4. Build the prompt
            const systemPrompt = this.buildSystemPrompt(
                tone?.content || "",
                categories,
                techLogos,
                authors,
                existingPosts,
                {
                    includeDiagrams: options.includeDiagrams,
                    includeCharts: options.includeCharts,
                    includePlaygrounds: options.includePlaygrounds,
                    includeComparisonTables: options.includeComparisonTables,
                },
            );
            const userPrompt = this.buildUserPrompt(options, categories);

            // 5. Call Claude with tool use for structured output
            this.logger.log(`Generating blog post: "${options.topic}"`);
            const client = this.getClient();

            const response = await client.messages.create({
                model: options.model || DEFAULT_MODEL,
                max_tokens: 16384,
                system: systemPrompt,
                messages: [{ role: "user", content: userPrompt }],
                tool_choice: { type: "tool", name: "create_blog_post" },
                tools: [
                    {
                        name: "create_blog_post",
                        description: "Create a blog post with all required fields",
                        input_schema: {
                            type: "object" as const,
                            required: [
                                "title",
                                "slug",
                                "content",
                                "excerpt",
                                "tags",
                                "category",
                                "seo",
                                "faq",
                            ],
                            properties: {
                                title: { type: "string", description: "Blog post title" },
                                slug: {
                                    type: "string",
                                    description: "URL slug, lowercase with dashes",
                                },
                                content: {
                                    type: "string",
                                    description: "Full blog content in Markdown",
                                },
                                excerpt: { type: "string", description: "1-2 sentence summary" },
                                tags: {
                                    type: "array",
                                    items: { type: "string" },
                                    description: "Relevant tags",
                                },
                                category: {
                                    type: "string",
                                    description: "Category ID from the provided list",
                                },
                                techLogo: {
                                    type: "string",
                                    description: "Tech logo ID if relevant",
                                },
                                techLogoColor: {
                                    type: "string",
                                    description: "Hex color for logo",
                                },
                                techLogoBgColor: {
                                    type: "string",
                                    description: "Hex gradient start color",
                                },
                                techLogoBgColorTo: {
                                    type: "string",
                                    description: "Hex gradient end color",
                                },
                                seo: {
                                    type: "object",
                                    properties: {
                                        metaTitle: { type: "string", description: "Max 60 chars" },
                                        metaDescription: {
                                            type: "string",
                                            description: "Max 155 chars",
                                        },
                                        focusKeyword: { type: "string" },
                                    },
                                },
                                faq: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            question: { type: "string" },
                                            answer: { type: "string" },
                                        },
                                        required: ["question", "answer"],
                                    },
                                    description: "3-5 unique FAQ items",
                                },
                            },
                        },
                    },
                ],
            });

            const inputTokens = response.usage?.input_tokens || 0;
            const outputTokens = response.usage?.output_tokens || 0;

            // Extract the tool use result - already parsed, no JSON parsing needed
            const toolUse = response.content.find((c) => c.type === "tool_use");
            if (!toolUse || toolUse.type !== "tool_use") {
                throw new Error("Claude did not return a tool use response");
            }

            const parsed = toolUse.input as ParsedBlogPost;

            // 7. Determine category
            const categoryId =
                options.categoryId || parsed.category || categories[0]?._id?.toString();

            // 8. Create the draft
            const slug = await this.slugService.ensureUnique(
                this.slugService.generateSlug(parsed.slug || parsed.title),
                this.blogPostModel,
            );

            const wordCount = parsed.content.trim().split(/\s+/).filter(Boolean).length;
            const author = authors[0];

            const post = new this.blogPostModel({
                title: parsed.title,
                slug,
                content: parsed.content,
                excerpt: parsed.excerpt,
                tags: parsed.tags,
                category: categoryId,
                status: "draft",
                author: author?._id?.toString(),
                techLogo: parsed.techLogo,
                techLogoColor: parsed.techLogoColor,
                techLogoBgColor: parsed.techLogoBgColor,
                techLogoBgColorTo: parsed.techLogoBgColorTo,
                seo: parsed.seo || {},
                faq: parsed.faq || [],
                readingTime: Math.max(1, Math.ceil(wordCount / 200)),
            });

            const saved = await post.save();

            // 9. Log the generation
            const tokensUsed = inputTokens + outputTokens;
            const generation = await this.generationModel.create({
                topic: options.topic,
                tone: tone?.name || "default",
                category: categoryId,
                status: "success",
                createdPost: saved._id.toString(),
                tokensUsed,
                durationMs: Date.now() - startTime,
            });

            this.logger.log(
                `Blog post created: "${saved.title}" (${wordCount} words, ${tokensUsed} tokens)`,
            );

            return {
                postId: saved._id.toString(),
                generationId: generation._id.toString(),
            };
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Blog generation failed: ${errMsg}`);

            await this.generationModel.create({
                topic: options.topic,
                tone: options.toneId || "default",
                category: options.categoryId,
                status: "failed",
                error: errMsg,
                durationMs: Date.now() - startTime,
            });

            throw error;
        }
    }

    private buildSystemPrompt(
        toneContent: string,
        categories: Array<{ name: string; slug: string; _id: unknown }>,
        techLogos: Array<{ name: string; slug: string; _id: unknown }>,
        _authors: Array<{ name: string; _id: unknown }>,
        existingPosts: Array<{ title: string; slug: string; tags?: string[] }>,
        mediaOptions?: {
            includeDiagrams?: boolean;
            includeCharts?: boolean;
            includePlaygrounds?: boolean;
            includeComparisonTables?: boolean;
        },
    ): string {
        const categoryList = categories.map((c) => `- ${c.name} (ID: ${c._id})`).join("\n");
        const logoList = techLogos.map((l) => `- ${l.name} / ${l.slug} (ID: ${l._id})`).join("\n");
        const existingList = existingPosts
            .map((p) => `- "${p.title}" [${p.slug}] tags: ${(p.tags || []).join(", ")}`)
            .join("\n");

        return `You are a professional blog writer. You write high-quality tech blog posts. Use the create_blog_post tool to submit your post.

${toneContent ? `## WRITING TONE & STYLE\n${toneContent}\n` : ""}

## AVAILABLE CATEGORIES
${categoryList}

## AVAILABLE TECH LOGOS (use ID if the post is about one of these)
${logoList}

## EXISTING POSTS - DO NOT DUPLICATE
${existingList || "No existing posts yet."}

Do NOT write about any topic that overlaps with the existing posts above. If the requested topic overlaps, write about a related but clearly different angle.

## RULES
- Always include 3-5 FAQ items with UNIQUE questions (no duplicates)
- Content should be 1000-1500+ words
- Use Markdown with ## and ### headings
- Use fenced code blocks with language tags where appropriate
- Status is always "draft" - do not include status in your output
- Pick the most relevant category from the list
- Pick a tech logo if the post is about a specific technology
- NEVER use em dashes (—) or en dashes (–). Use hyphens (-), commas, or rewrite the sentence instead
${
    mediaOptions?.includeDiagrams
        ? `
## DIAGRAMS
Include 1-2 diagrams where they add clarity (architecture, data flow, comparisons). Use \`\`\`chart code blocks containing a valid Chart.js JSON config object. Keep diagrams simple and readable.

Example:
\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Option A", "Option B", "Option C"],
    "datasets": [{ "label": "Performance (ms)", "data": [120, 85, 200] }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "Comparison Title" } },
    "scales": { "y": { "beginAtZero": true } }
  }
}
\`\`\`

Supported chart types: bar, line, pie, doughnut, radar, polarArea. Colors and theming are applied automatically -do NOT specify backgroundColor or borderColor.`
        : ""
}
${
    mediaOptions?.includeCharts
        ? `
## DATA CHARTS
When presenting numerical data, benchmarks, or performance comparisons, use Chart.js charts instead of plain text. Use \`\`\`chart code blocks with a valid Chart.js JSON config. Pick the chart type that best fits the data:
- **bar** - comparing discrete categories (benchmarks, feature counts, install times)
- **line** - showing trends over time (adoption, performance over versions)
- **pie/doughnut** - showing proportions (market share, distribution)
- **radar** - comparing multiple dimensions (feature comparison across tools)

Example:
\`\`\`chart
{
  "type": "bar",
  "data": {
    "labels": ["Tool A", "Tool B", "Tool C"],
    "datasets": [{ "label": "Requests/sec", "data": [45000, 72000, 160000] }]
  },
  "options": {
    "plugins": { "title": { "display": true, "text": "HTTP Throughput (Higher is Better)" } },
    "scales": { "y": { "beginAtZero": true } }
  }
}
\`\`\`

Colors and theming are applied automatically - do NOT specify backgroundColor or borderColor. Keep the JSON valid and minimal.`
        : ""
}
${
    mediaOptions?.includePlaygrounds
        ? `
## CODE PLAYGROUNDS
For key code examples, include embedded code playgrounds using this syntax in the markdown:
<!-- stackblitz:project-id --> or <!-- codesandbox:sandbox-id -->
Only include these for examples that benefit from being interactive. Use real project IDs from StackBlitz or CodeSandbox.`
        : ""
}
${
    mediaOptions?.includeComparisonTables
        ? `
## COMPARISON TABLES
Include at least one well-structured markdown comparison table. Use tables for feature comparisons, pros/cons, tool comparisons, or performance metrics. Format clearly with aligned columns.`
        : ""
}`;
    }

    async refine(options: RefineOptions): Promise<RefinedBlogPost> {
        const post = await this.blogPostModel
            .findById(options.postId)
            .select("title content excerpt tags seo faq")
            .lean()
            .exec();

        if (!post) throw new Error(`Post not found: ${options.postId}`);

        const tone = await this.toneModel.findOne({ isDefault: true }).exec();

        const snapshot: ExistingPostSnapshot = {
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            tags: post.tags as string[] | undefined,
            seo: post.seo as ExistingPostSnapshot["seo"],
            faq: post.faq as Array<{ question: string; answer: string }> | undefined,
        };

        const systemPrompt = this.buildRefineSystemPrompt(tone?.content || "", snapshot);

        this.logger.log(`Refining blog post "${post.title}" — prompt: "${options.prompt}"`);
        const client = this.getClient();

        const response = await client.messages.create({
            model: options.model || DEFAULT_MODEL,
            max_tokens: 16384,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: `Apply this change to the blog post: ${options.prompt}\n\nUse the create_blog_post tool to submit the refined version.`,
                },
            ],
            tool_choice: { type: "tool", name: "create_blog_post" },
            tools: [
                {
                    name: "create_blog_post",
                    description: "Submit the refined blog post with all required fields",
                    input_schema: {
                        type: "object" as const,
                        required: ["title", "slug", "content", "excerpt", "tags", "category", "seo", "faq"],
                        properties: {
                            title: { type: "string" },
                            slug: { type: "string" },
                            content: { type: "string", description: "Full blog content in Markdown" },
                            excerpt: { type: "string" },
                            tags: { type: "array", items: { type: "string" } },
                            category: { type: "string" },
                            techLogo: { type: "string" },
                            techLogoColor: { type: "string" },
                            techLogoBgColor: { type: "string" },
                            techLogoBgColorTo: { type: "string" },
                            seo: {
                                type: "object",
                                properties: {
                                    metaTitle: { type: "string" },
                                    metaDescription: { type: "string" },
                                    focusKeyword: { type: "string" },
                                },
                            },
                            faq: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        question: { type: "string" },
                                        answer: { type: "string" },
                                    },
                                    required: ["question", "answer"],
                                },
                            },
                        },
                    },
                },
            ],
        });

        const toolUse = response.content.find((c) => c.type === "tool_use");
        if (!toolUse || toolUse.type !== "tool_use") {
            throw new Error("Claude did not return a tool use response");
        }

        const parsed = toolUse.input as ParsedBlogPost;
        return {
            title: parsed.title,
            content: parsed.content,
            excerpt: parsed.excerpt,
            tags: parsed.tags,
            seo: parsed.seo || { metaTitle: "", metaDescription: "" },
            faq: parsed.faq || [],
        };
    }

    private buildRefineSystemPrompt(toneContent: string, post: ExistingPostSnapshot): string {
        const faqText =
            (post.faq || [])
                .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
                .join("\n\n") || "None";

        return `You are editing an existing blog post. Apply only the requested changes while preserving the original writing style, voice, and tone exactly as they are.

${toneContent ? `## WRITING TONE & STYLE\n${toneContent}\n` : ""}

## RULES
- Preserve the existing voice and tone
- Only modify what is explicitly requested - keep everything else as-is
- Always include 3-5 FAQ items (keep existing ones unless asked to change them)
- NEVER use em dashes (—) or en dashes (–). Use hyphens (-), commas, or rewrite instead
- The slug and category fields must be returned but should remain the same as the original

## EXISTING POST

### Title
${post.title}

### Excerpt
${post.excerpt}

### Tags
${(post.tags || []).join(", ") || "None"}

### SEO
Meta Title: ${post.seo?.metaTitle || ""}
Meta Description: ${post.seo?.metaDescription || ""}
Focus Keyword: ${post.seo?.focusKeyword || ""}

### FAQ
${faqText}

### Content
${post.content}`;
    }

    private buildUserPrompt(
        options: GenerateOptions,
        categories: Array<{ name: string; slug: string; _id: unknown }>,
    ): string {
        let prompt = `Write a blog post about: ${options.topic}`;

        if (options.categoryId) {
            const cat = categories.find((c) => c._id?.toString() === options.categoryId);
            if (cat) prompt += `\n\nCategory: ${cat.name} (ID: ${cat._id})`;
        }

        if (options.type) {
            prompt += `\n\nPost type: ${options.type}`;
            if (options.type === "oss") prompt += " - Focus on an open source project/tool.";
            if (options.type === "ai")
                prompt += " - Focus on AI tools, LLMs, or AI in development.";
            if (options.type === "aff")
                prompt += " - Naturally recommend relevant paid tools/services.";
        }

        prompt += "\n\nUse the create_blog_post tool to submit the complete blog post.";
        return prompt;
    }
}
