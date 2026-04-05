import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TechLogoDocument = HydratedDocument<TechLogo>;

@Schema({ timestamps: true })
export class TechLogo {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug!: string;

    @Prop({ type: [String], required: true })
    paths!: string[];

    @Prop({ required: true })
    color!: string;

    @Prop()
    bgColor?: string;

    @Prop({ default: "0 0 24 24" })
    viewBox?: string;

    @Prop({ default: "evenodd", enum: ["evenodd", "nonzero"] })
    fillRule?: string;

    @Prop({ enum: ["manual", "simple-icons"] })
    source?: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export const TechLogoSchema = SchemaFactory.createForClass(TechLogo);

TechLogoSchema.index({ slug: 1 });
