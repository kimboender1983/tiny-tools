import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type WritingToneDocument = HydratedDocument<WritingTone>;

@Schema({ timestamps: true })
export class WritingTone {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ default: false })
    isDefault!: boolean;

    createdAt!: Date;
    updatedAt!: Date;
}

export const WritingToneSchema = SchemaFactory.createForClass(WritingTone);
