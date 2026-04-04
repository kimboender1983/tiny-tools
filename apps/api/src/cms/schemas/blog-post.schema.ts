import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { FaqItem, FaqItemSchema } from "./page.schema";
import { SeoFields, SeoFieldsSchema } from "./seo-fields.schema";

export type BlogPostDocument = HydratedDocument<BlogPost>;

@Schema({ timestamps: true })
export class BlogPost {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug!: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ required: true })
    excerpt!: string;

    @Prop()
    coverImage?: string;

    @Prop()
    category?: string;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({
        required: true,
        enum: ["draft", "published", "archived"],
        default: "draft",
    })
    status!: string;

    @Prop({ type: SeoFieldsSchema, default: () => ({}) })
    seo!: SeoFields;

    @Prop({ default: undefined })
    author?: string;

    @Prop({ type: [FaqItemSchema] })
    faq?: FaqItem[];

    @Prop({ default: false })
    featured!: boolean;

    @Prop({ default: false })
    featuredHomepage!: boolean;

    @Prop({ default: false })
    homepageHero!: boolean;

    @Prop()
    readingTime?: number;

    @Prop({ type: [String] })
    relatedPosts?: string[];

    @Prop()
    publishedAt?: Date;

    createdAt!: Date;
    updatedAt!: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ status: 1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ featured: 1, status: 1 });
BlogPostSchema.index({ featuredHomepage: 1, status: 1 });
