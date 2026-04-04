import { Type } from "class-transformer";
import {
    IsArray,
    IsDateString,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { SeoFieldsDto } from "./seo-fields.dto";

class FaqItemDto {
    @IsString()
    question!: string;

    @IsString()
    answer!: string;
}

export class CreatePageDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsIn(["draft", "published", "archived"])
    status?: string;

    @IsOptional()
    @IsIn(["tool", "static", "landing"])
    template?: string;

    @ValidateNested()
    @Type(() => SeoFieldsDto)
    seo!: SeoFieldsDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaqItemDto)
    faq?: FaqItemDto[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    relatedPages?: string[];

    @IsOptional()
    @IsIn(["none", "header", "footer", "both"])
    navPlacement?: string;

    @IsOptional()
    @IsString()
    navLabel?: string;

    @IsOptional()
    @IsString()
    footerGroup?: string;

    @IsOptional()
    @IsNumber()
    footerGroupOrder?: number;

    @IsOptional()
    @IsNumber()
    order?: number;

    @IsOptional()
    @IsDateString()
    publishedAt?: string;
}
