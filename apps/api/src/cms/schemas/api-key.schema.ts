import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: true })
export class ApiKey {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, unique: true })
    key!: string;

    @Prop({ type: [String], default: ["blog:create"] })
    permissions!: string[];

    @Prop({ default: true })
    active!: boolean;

    @Prop()
    lastUsedAt?: Date;

    createdAt!: Date;
    updatedAt!: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

ApiKeySchema.index({ key: 1 });
