import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AuthorDocument = HydratedDocument<Author>;

@Schema({ timestamps: true })
export class Author {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop()
    bio?: string;

    @Prop()
    avatar?: string;

    createdAt!: Date;
    updatedAt!: Date;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
