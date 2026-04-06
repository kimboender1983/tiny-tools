import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BlogGenerationDocument = HydratedDocument<BlogGeneration>;

@Schema({ timestamps: true })
export class BlogGeneration {
    @Prop({ required: true })
    topic!: string;

    @Prop()
    tone?: string;

    @Prop()
    category?: string;

    @Prop({ required: true, enum: ["success", "failed"] })
    status!: string;

    @Prop()
    error?: string;

    @Prop()
    createdPost?: string;

    @Prop()
    tokensUsed?: number;

    @Prop()
    durationMs?: number;

    createdAt!: Date;
    updatedAt!: Date;
}

export const BlogGenerationSchema = SchemaFactory.createForClass(BlogGeneration);
