import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, SortOrder } from "mongoose";
import { CreatePageDto } from "../dto/create-page.dto";
import { QueryFilterDto } from "../dto/query-filter.dto";
import { UpdatePageDto } from "../dto/update-page.dto";
import { Page, PageDocument } from "../schemas/page.schema";
import { SlugService } from "./slug.service";

@Injectable()
export class PagesService {
    constructor(
        @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
        private readonly slugService: SlugService,
    ) {}

    async create(dto: CreatePageDto): Promise<PageDocument> {
        const slug = dto.slug
            ? this.slugService.generateSlug(dto.slug)
            : this.slugService.generateSlug(dto.title);

        const uniqueSlug = await this.slugService.ensureUnique(slug, this.pageModel);

        const data: Record<string, unknown> = {
            ...dto,
            slug: uniqueSlug,
            status: dto.status || "draft",
            template: dto.template || "static",
        };

        if (dto.status === "published" && !dto.publishedAt) {
            data.publishedAt = new Date();
        }

        const page = new this.pageModel(data);
        return page.save();
    }

    async findAll(query: QueryFilterDto) {
        const filter: FilterQuery<Page> = {};

        if (query.status) {
            filter.status = query.status;
        }
        if (query.category) {
            filter.category = query.category;
        }
        if (query.template) {
            filter.template = query.template;
        }
        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: "i" } },
                { content: { $regex: query.search, $options: "i" } },
            ];
        }

        const page = query.page || 1;
        const limit = query.limit || 20;
        const sortBy = query.sortBy || "createdAt";
        const sortOrder: SortOrder = query.sortOrder === "asc" ? 1 : -1;

        const [items, total] = await Promise.all([
            this.pageModel
                .find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.pageModel.countDocuments(filter).exec(),
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string): Promise<PageDocument> {
        const page = await this.pageModel.findById(id).exec();
        if (!page) {
            throw new NotFoundException(`Page with id "${id}" not found`);
        }
        return page;
    }

    async findBySlug(slug: string): Promise<PageDocument> {
        const page = await this.pageModel.findOne({ slug }).exec();
        if (!page) {
            throw new NotFoundException(`Page with slug "${slug}" not found`);
        }
        return page;
    }

    async update(id: string, dto: UpdatePageDto): Promise<PageDocument> {
        const existing = await this.findById(id);

        if (dto.slug && dto.slug !== existing.slug) {
            const newSlug = this.slugService.generateSlug(dto.slug);
            dto.slug = await this.slugService.ensureUnique(newSlug, this.pageModel, id);
        }

        if (dto.status === "published" && existing.status !== "published" && !dto.publishedAt) {
            (dto as Record<string, unknown>).publishedAt = new Date();
        }

        const updated = await this.pageModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
            .exec();

        if (!updated) {
            throw new NotFoundException(`Page with id "${id}" not found`);
        }
        return updated;
    }

    async batchUpdateStatus(ids: string[], status: string): Promise<{ modifiedCount: number }> {
        const result = await this.pageModel
            .updateMany({ _id: { $in: ids } }, { $set: { status } })
            .exec();
        return { modifiedCount: result.modifiedCount };
    }

    async delete(id: string): Promise<void> {
        const result = await this.pageModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Page with id "${id}" not found`);
        }
    }
}
