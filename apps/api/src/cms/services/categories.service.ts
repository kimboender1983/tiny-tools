import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogPost, BlogPostDocument } from "../schemas/blog-post.schema";
import { Category, CategoryDocument } from "../schemas/category.schema";
import { Page, PageDocument } from "../schemas/page.schema";
import { SlugService } from "./slug.service";

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private readonly categoryModel: Model<CategoryDocument>,
        @InjectModel(Page.name)
        private readonly pageModel: Model<PageDocument>,
        @InjectModel(BlogPost.name)
        private readonly blogPostModel: Model<BlogPostDocument>,
        private readonly slugService: SlugService,
    ) {}

    async create(dto: Record<string, unknown>): Promise<CategoryDocument> {
        const slug = (dto.slug as string)
            ? this.slugService.generateSlug(dto.slug as string)
            : this.slugService.generateSlug(dto.name as string);

        const uniqueSlug = await this.slugService.ensureUnique(slug, this.categoryModel);

        const category = new this.categoryModel({ ...dto, slug: uniqueSlug });
        return category.save();
    }

    async findAll(): Promise<CategoryDocument[]> {
        return this.categoryModel.find().sort({ order: 1 }).exec();
    }

    async findById(id: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findById(id).exec();
        if (!category) {
            throw new NotFoundException(`Category with id "${id}" not found`);
        }
        return category;
    }

    async findBySlug(slug: string): Promise<CategoryDocument> {
        const category = await this.categoryModel.findOne({ slug }).exec();
        if (!category) {
            throw new NotFoundException(`Category with slug "${slug}" not found`);
        }
        return category;
    }

    async update(id: string, dto: Record<string, unknown>): Promise<CategoryDocument> {
        const existing = await this.findById(id);

        if (dto.slug && dto.slug !== existing.slug) {
            const newSlug = this.slugService.generateSlug(dto.slug as string);
            dto.slug = await this.slugService.ensureUnique(newSlug, this.categoryModel, id);
        }

        const updated = await this.categoryModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
            .exec();

        if (!updated) {
            throw new NotFoundException(`Category with id "${id}" not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const category = await this.findById(id);
        const slug = category.slug;

        const [pageCount, postCount] = await Promise.all([
            this.pageModel.countDocuments({ category: slug }).exec(),
            this.blogPostModel.countDocuments({ category: slug }).exec(),
        ]);

        if (pageCount > 0 || postCount > 0) {
            throw new ConflictException(
                `Cannot delete category: it is referenced by ${pageCount} page(s) and ${postCount} blog post(s)`,
            );
        }

        await this.categoryModel.findByIdAndDelete(id).exec();
    }
}
