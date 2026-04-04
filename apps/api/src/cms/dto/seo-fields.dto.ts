import { IsArray, IsBoolean, IsIn, IsObject, IsOptional, IsString } from "class-validator";

export class SeoFieldsDto {
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsString()
    canonicalUrl?: string;

    @IsOptional()
    @IsString()
    ogTitle?: string;

    @IsOptional()
    @IsString()
    ogDescription?: string;

    @IsOptional()
    @IsString()
    ogImage?: string;

    @IsOptional()
    @IsIn(["summary", "summary_large_image"])
    twitterCard?: "summary" | "summary_large_image";

    @IsOptional()
    @IsBoolean()
    noIndex?: boolean;

    @IsOptional()
    @IsString()
    focusKeyword?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    secondaryKeywords?: string[];

    @IsOptional()
    @IsObject()
    structuredData?: Record<string, unknown>;
}
