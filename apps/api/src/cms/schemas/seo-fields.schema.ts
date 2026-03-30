import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class SeoFields {
  @Prop({ default: '' })
  metaTitle!: string;

  @Prop({ default: '' })
  metaDescription!: string;

  @Prop()
  canonicalUrl?: string;

  @Prop()
  ogTitle?: string;

  @Prop()
  ogDescription?: string;

  @Prop()
  ogImage?: string;

  @Prop({ enum: ['summary', 'summary_large_image'] })
  twitterCard?: string;

  @Prop({ default: false })
  noIndex?: boolean;

  @Prop()
  focusKeyword?: string;

  @Prop({ type: [String] })
  secondaryKeywords?: string[];

  @Prop({ type: Object })
  structuredData?: Record<string, unknown>;
}

export const SeoFieldsSchema = SchemaFactory.createForClass(SeoFields);
