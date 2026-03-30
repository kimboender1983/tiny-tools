import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SeoFieldsDto } from './seo-fields.dto';

class FaqItemDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class CreateBlogPostDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  content!: string;

  @IsString()
  excerpt!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoFieldsDto)
  seo?: SeoFieldsDto;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faq?: FaqItemDto[];

  @IsOptional()
  @IsNumber()
  readingTime?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedPosts?: string[];

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
