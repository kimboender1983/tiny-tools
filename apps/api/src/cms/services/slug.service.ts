import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

@Injectable()
export class SlugService {
    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    async ensureUnique(
        baseSlug: string,
        // biome-ignore lint/suspicious/noExplicitAny: Mongoose Model requires generic flexibility across schema types
        model: Model<any>,
        excludeId?: string,
    ): Promise<string> {
        let slug = baseSlug;
        let counter = 0;

        while (true) {
            const query: Record<string, unknown> = { slug };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }

            const existing = await model.findOne(query).lean().exec();
            if (!existing) {
                return slug;
            }

            counter++;
            slug = `${baseSlug}-${counter}`;
        }
    }
}
