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

export class CreatePageDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: string;

  @IsOptional()
  @IsIn(['tool', 'static', 'landing'])
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
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
