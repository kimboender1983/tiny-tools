import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from "class-validator";

class SeoFieldsApiDto {
    @ApiPropertyOptional({ description: "SEO title (max 60 chars)", example: "Vue 3 Guide | Pickbox" })
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @ApiPropertyOptional({ description: "SEO description (max 160 chars)", example: "Complete guide to Vue 3 Composition API." })
    @IsOptional()
    @IsString()
    metaDescription?: string;

    @ApiPropertyOptional({ description: "Primary keyword for SEO", example: "vue 3 composition api" })
    @IsOptional()
    @IsString()
    focusKeyword?: string;

    @ApiPropertyOptional({ description: "Custom OG image URL (if omitted, auto-generated)" })
    @IsOptional()
    @IsString()
    ogImage?: string;
}

class AffiliateCtaApiDto {
    @ApiProperty({ description: "Affiliate slug (from /content/affiliates)", example: "vultr" })
    @IsString()
    affiliate!: string;

    @ApiProperty({ description: "CTA headline", example: "Try Vultr Free" })
    @IsString()
    headline!: string;

    @ApiPropertyOptional({ description: "CTA body in markdown", example: "Get $100 free credit when you sign up." })
    @IsOptional()
    @IsString()
    body?: string;

    @ApiProperty({ description: "Button label", example: "Get Started Free →" })
    @IsString()
    buttonText!: string;

    @ApiPropertyOptional({ description: "Small disclaimer text", example: "We may earn a commission at no extra cost to you." })
    @IsOptional()
    @IsString()
    disclaimer?: string;
}

class FaqItemApiDto {
    @ApiProperty({ description: "FAQ question", example: "What is the Composition API?" })
    @IsString()
    question!: string;

    @ApiProperty({ description: "FAQ answer in markdown", example: "The Composition API is a set of APIs..." })
    @IsString()
    answer!: string;
}

export class CreateBlogApiDto {
    @ApiProperty({ description: "Blog post title", example: "Getting Started with Vue 3 Composition API" })
    @IsString()
    title!: string;

    @ApiProperty({ description: "Full blog content in Markdown", example: "# Introduction\n\nVue 3 introduces..." })
    @IsString()
    content!: string;

    @ApiProperty({ description: "Short description shown in cards (1-2 sentences)", example: "Learn how to use Vue 3 Composition API." })
    @IsString()
    excerpt!: string;

    @ApiPropertyOptional({ description: "URL slug (auto-generated from title if omitted)", example: "getting-started-with-vue-3" })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: "Cover image URL. If omitted, auto-generated from tech logo" })
    @IsOptional()
    @IsString()
    coverImage?: string;

    @ApiPropertyOptional({ description: "Category ID. Get valid IDs from GET /content/categories" })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: "Array of tag strings", example: ["vue", "javascript", "tutorial"], type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ description: "Post status", enum: ["draft", "published"], default: "draft" })
    @IsOptional()
    @IsIn(["draft", "published"])
    status?: "draft" | "published";

    @ApiPropertyOptional({ description: "Author ID" })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({ description: "Tech Logo ID. Get valid IDs from GET /content/tech-logos. Drives auto-generated cover images" })
    @IsOptional()
    @IsString()
    techLogo?: string;

    @ApiPropertyOptional({ description: "Hex color override for the tech logo on covers", example: "#4FC08D" })
    @IsOptional()
    @IsString()
    techLogoColor?: string;

    @ApiPropertyOptional({ description: "Cover gradient start color", example: "#1e3a5f" })
    @IsOptional()
    @IsString()
    techLogoBgColor?: string;

    @ApiPropertyOptional({ description: "Cover gradient end color (auto-darkened if omitted)", example: "#0f2027" })
    @IsOptional()
    @IsString()
    techLogoBgColorTo?: string;

    @ApiPropertyOptional({ description: "Pickbox logo color on covers", example: "#ffffff" })
    @IsOptional()
    @IsString()
    techLogoPickboxColor?: string;

    @ApiPropertyOptional({ description: "Title text color on covers", example: "#ffffff" })
    @IsOptional()
    @IsString()
    techLogoTitleColor?: string;

    @ApiPropertyOptional({ description: "Affiliate CTA block shown at the bottom of the blog post", type: AffiliateCtaApiDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => AffiliateCtaApiDto)
    affiliateCta?: AffiliateCtaApiDto;

    @ApiPropertyOptional({ description: "SEO metadata", type: SeoFieldsApiDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => SeoFieldsApiDto)
    seo?: SeoFieldsApiDto;

    @ApiPropertyOptional({ description: "FAQ items for structured data", type: [FaqItemApiDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaqItemApiDto)
    faq?: FaqItemApiDto[];

    @ApiPropertyOptional({ description: "ISO date string. Auto-set to now if status is published", example: "2026-04-05T12:00:00.000Z" })
    @IsOptional()
    @IsString()
    publishedAt?: string;
}
