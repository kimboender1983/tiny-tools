import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true })
    passwordHash!: string;

    @Prop({ trim: true })
    name?: string;

    @Prop()
    avatar?: string;

    @Prop({ default: "admin" })
    role!: string;

    @Prop({ default: "free" })
    plan!: string;

    @Prop({
        type: Object,
        default: { theme: "system", defaultIndentation: 2, recentTools: [] },
    })
    preferences!: {
        theme: string;
        defaultIndentation: number;
        recentTools: string[];
    };
}

export const UserSchema = SchemaFactory.createForClass(User);
