import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BlogFeedbackDocument = HydratedDocument<BlogFeedback>;

@Schema({ timestamps: true })
export class BlogFeedback {
    @Prop({ required: true, index: true })
    postSlug!: string;

    @Prop({ required: true, maxlength: 2000 })
    message!: string;

    @Prop()
    email?: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export const BlogFeedbackSchema = SchemaFactory.createForClass(BlogFeedback);
