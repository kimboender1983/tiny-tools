import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { SeoFields, SeoFieldsSchema } from "./seo-fields.schema";

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug!: string;

    @Prop()
    description?: string;

    @Prop()
    icon?: string;

    @Prop({ default: 0 })
    order!: number;

    @Prop()
    parentCategory?: string;

    @Prop({ type: SeoFieldsSchema, required: true })
    seo!: SeoFields;

    createdAt!: Date;
    updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ order: 1 });
