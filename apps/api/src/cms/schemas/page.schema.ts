import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SeoFields, SeoFieldsSchema } from './seo-fields.schema';

export type PageDocument = HydratedDocument<Page>;

@Schema({ _id: false })
export class FaqItem {
  @Prop({ required: true })
  question!: string;

  @Prop({ required: true })
  answer!: string;
}

export const FaqItemSchema = SchemaFactory.createForClass(FaqItem);

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  excerpt?: string;

  @Prop()
  category?: string;

  @Prop({ required: true, enum: ['draft', 'published', 'archived'], default: 'draft' })
  status!: string;

  @Prop({ required: true, enum: ['tool', 'static', 'landing'], default: 'static' })
  template!: string;

  @Prop({ type: SeoFieldsSchema, required: true })
  seo!: SeoFields;

  @Prop({ type: [FaqItemSchema] })
  faq?: FaqItem[];

  @Prop({ type: [String] })
  relatedPages?: string[];

  @Prop()
  order?: number;

  @Prop()
  publishedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PageSchema = SchemaFactory.createForClass(Page);

PageSchema.index({ slug: 1 });
PageSchema.index({ status: 1 });
PageSchema.index({ category: 1 });
