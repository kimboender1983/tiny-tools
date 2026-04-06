import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SchedulerConfigDocument = HydratedDocument<SchedulerConfig>;

@Schema({ timestamps: true })
export class SchedulerConfig {
    @Prop({ default: false })
    enabled!: boolean;

    @Prop({ required: true, enum: ["15min", "30min", "hourly", "daily", "weekly"], default: "daily" })
    interval!: string;

    @Prop()
    defaultTone?: string;

    @Prop({ default: "claude-sonnet-4-6" })
    aiModel?: string;

    @Prop({ type: [String], default: [] })
    categoryRotation!: string[];

    @Prop({ default: 0 })
    lastCategoryIndex!: number;

    @Prop()
    lastRunAt?: Date;

    updatedAt!: Date;
}

export const SchedulerConfigSchema = SchemaFactory.createForClass(SchedulerConfig);
