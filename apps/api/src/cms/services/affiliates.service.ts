import * as crypto from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Affiliate, AffiliateDocument } from "../schemas/affiliate.schema";
import { AffiliateClick, AffiliateClickDocument } from "../schemas/affiliate-click.schema";
import { SlugService } from "./slug.service";

@Injectable()
export class AffiliatesService {
    constructor(
        @InjectModel(Affiliate.name)
        private readonly affiliateModel: Model<AffiliateDocument>,
        @InjectModel(AffiliateClick.name)
        private readonly clickModel: Model<AffiliateClickDocument>,
        private readonly slugService: SlugService,
    ) {}

    async create(dto: Record<string, unknown>): Promise<AffiliateDocument> {
        const slug = (dto.slug as string)
            ? this.slugService.generateSlug(dto.slug as string)
            : this.slugService.generateSlug(dto.name as string);

        const uniqueSlug = await this.slugService.ensureUnique(slug, this.affiliateModel);
        const affiliate = new this.affiliateModel({ ...dto, slug: uniqueSlug });
        return affiliate.save();
    }

    async findAll() {
        const items = await this.affiliateModel.find().sort({ name: 1 }).exec();
        return { items, total: items.length, page: 1, pageSize: items.length };
    }

    async findById(id: string): Promise<AffiliateDocument> {
        const affiliate = await this.affiliateModel.findById(id).exec();
        if (!affiliate) {
            throw new NotFoundException(`Affiliate with id "${id}" not found`);
        }
        return affiliate;
    }

    async findBySlug(slug: string): Promise<AffiliateDocument> {
        const affiliate = await this.affiliateModel.findOne({ slug, status: "active" }).exec();
        if (!affiliate) {
            throw new NotFoundException(`Affiliate "${slug}" not found`);
        }
        return affiliate;
    }

    async findAllActive(): Promise<{ slug: string; name: string }[]> {
        return this.affiliateModel.find({ status: "active" }).select("slug name").lean().exec();
    }

    async update(id: string, dto: Record<string, unknown>): Promise<AffiliateDocument> {
        const existing = await this.findById(id);

        if (dto.slug && dto.slug !== existing.slug) {
            const newSlug = this.slugService.generateSlug(dto.slug as string);
            dto.slug = await this.slugService.ensureUnique(newSlug, this.affiliateModel, id);
        }

        const updated = await this.affiliateModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
            .exec();
        if (!updated) {
            throw new NotFoundException(`Affiliate with id "${id}" not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const result = await this.affiliateModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Affiliate with id "${id}" not found`);
        }
    }

    // --- Click tracking ---

    async trackClick(
        affiliateId: string,
        page?: string,
        ip?: string,
        userAgent?: string,
    ): Promise<void> {
        const hashedIp = ip
            ? crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16)
            : undefined;

        await this.clickModel.create({
            affiliate: affiliateId,
            page,
            ip: hashedIp,
            userAgent,
        });
    }

    // --- Analytics ---

    async getAnalytics(affiliateId: string, days = 30) {
        const affiliate = await this.findById(affiliateId);
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [dailyClicks, topPages, totalClicks] = await Promise.all([
            this.clickModel.aggregate([
                { $match: { affiliate: affiliate._id, createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                { $project: { date: "$_id", count: 1, _id: 0 } },
            ]),
            this.clickModel.aggregate([
                {
                    $match: {
                        affiliate: affiliate._id,
                        createdAt: { $gte: since },
                        page: { $ne: null },
                    },
                },
                { $group: { _id: "$page", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                { $project: { page: "$_id", count: 1, _id: 0 } },
            ]),
            this.clickModel
                .countDocuments({ affiliate: affiliate._id, createdAt: { $gte: since } })
                .exec(),
        ]);

        return {
            affiliateId: affiliate._id.toString(),
            name: affiliate.name,
            slug: affiliate.slug,
            totalClicks,
            topPages,
            dailyClicks,
        };
    }

    async getOverviewAnalytics(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [perAffiliate, dailyTotal] = await Promise.all([
            this.clickModel.aggregate([
                { $match: { createdAt: { $gte: since } } },
                { $group: { _id: "$affiliate", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                {
                    $lookup: {
                        from: "affiliates",
                        localField: "_id",
                        foreignField: "_id",
                        as: "aff",
                    },
                },
                { $unwind: "$aff" },
                {
                    $project: {
                        _id: 0,
                        affiliateId: { $toString: "$_id" },
                        name: "$aff.name",
                        slug: "$aff.slug",
                        totalClicks: "$count",
                    },
                },
            ]),
            this.clickModel.aggregate([
                { $match: { createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                { $project: { date: "$_id", count: 1, _id: 0 } },
            ]),
        ]);

        const totalClicks = perAffiliate.reduce(
            (sum: number, a: { totalClicks: number }) => sum + a.totalClicks,
            0,
        );

        return {
            totalClicks,
            perAffiliate,
            dailyClicks: dailyTotal,
        };
    }
}
