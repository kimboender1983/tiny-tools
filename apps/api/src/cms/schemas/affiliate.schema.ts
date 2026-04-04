import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AffiliateDocument = HydratedDocument<Affiliate>;

@Schema({ timestamps: true })
export class Affiliate {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug!: string;

    @Prop({ required: true })
    url!: string;

    @Prop()
    logo?: string;

    @Prop()
    description?: string;

    @Prop()
    programInfo?: string;

    @Prop({ required: true, enum: ["active", "inactive"], default: "active" })
    status!: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);

AffiliateSchema.index({ slug: 1 });
AffiliateSchema.index({ status: 1 });
