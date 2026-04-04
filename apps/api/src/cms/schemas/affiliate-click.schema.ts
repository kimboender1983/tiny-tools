import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Affiliate } from "./affiliate.schema";

export type AffiliateClickDocument = HydratedDocument<AffiliateClick>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AffiliateClick {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Affiliate.name, required: true })
    affiliate!: string;

    @Prop()
    page?: string;

    @Prop()
    ip?: string;

    @Prop()
    userAgent?: string;

    createdAt!: Date;
}

export const AffiliateClickSchema = SchemaFactory.createForClass(AffiliateClick);

AffiliateClickSchema.index({ affiliate: 1, createdAt: -1 });
AffiliateClickSchema.index({ createdAt: -1 });
