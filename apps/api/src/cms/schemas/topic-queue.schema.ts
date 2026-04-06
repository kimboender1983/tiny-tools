import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TopicQueueDocument = HydratedDocument<TopicQueue>;

@Schema({ timestamps: true })
export class TopicQueue {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop()
    notes?: string;

    @Prop()
    category?: string;

    @Prop({ required: true, enum: ["oss", "ai", "aff", "general"], default: "general" })
    type!: string;

    @Prop({ required: true, enum: ["pending", "processing", "completed", "failed"], default: "pending" })
    status!: string;

    @Prop({ default: 0 })
    priority!: number;

    @Prop()
    generatedPost?: string;

    @Prop()
    error?: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export const TopicQueueSchema = SchemaFactory.createForClass(TopicQueue);

TopicQueueSchema.index({ status: 1, priority: -1 });
