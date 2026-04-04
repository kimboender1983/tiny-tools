import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Media {
    @Prop({ required: true })
    filename!: string;

    @Prop({ required: true })
    url!: string;

    @Prop({ required: true })
    mimeType!: string;

    @Prop({ required: true })
    size!: number;

    @Prop()
    width?: number;

    @Prop()
    height?: number;

    @Prop()
    alt?: string;

    @Prop()
    caption?: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
