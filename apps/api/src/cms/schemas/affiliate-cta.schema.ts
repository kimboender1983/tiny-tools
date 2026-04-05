import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class AffiliateCta {
    @Prop({ required: true })
    affiliate!: string;

    @Prop({ required: true })
    headline!: string;

    @Prop()
    body?: string;

    @Prop({ required: true })
    buttonText!: string;

    @Prop()
    disclaimer?: string;
}

export const AffiliateCtaSchema = SchemaFactory.createForClass(AffiliateCta);
