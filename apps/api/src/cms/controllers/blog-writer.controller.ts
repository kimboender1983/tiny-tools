import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BlogGeneration, BlogGenerationDocument } from "../schemas/blog-generation.schema";
import { SchedulerConfig, SchedulerConfigDocument } from "../schemas/scheduler-config.schema";
import { TopicQueue, TopicQueueDocument } from "../schemas/topic-queue.schema";
import { WritingTone, WritingToneDocument } from "../schemas/writing-tone.schema";
import { BlogWriterService } from "../services/blog-writer.service";

// --- Writing Tones ---
@Controller("cms/blog-writer/tones")
@UseGuards(JwtAuthGuard, AdminGuard)
export class WritingTonesController {
    constructor(
        @InjectModel(WritingTone.name) private readonly toneModel: Model<WritingToneDocument>,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: { name: string; content: string; isDefault?: boolean }) {
        if (dto.isDefault) {
            await this.toneModel.updateMany({}, { isDefault: false }).exec();
        }
        return new this.toneModel(dto).save();
    }

    @Get()
    findAll() {
        return this.toneModel.find().sort({ isDefault: -1, name: 1 }).exec();
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.toneModel.findById(id).exec();
    }

    @Put(":id")
    async update(
        @Param("id") id: string,
        @Body() dto: { name?: string; content?: string; isDefault?: boolean },
    ) {
        if (dto.isDefault) {
            await this.toneModel.updateMany({ _id: { $ne: id } }, { isDefault: false }).exec();
        }
        return this.toneModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.toneModel.findByIdAndDelete(id).exec();
    }
}

// --- Topic Queue ---
@Controller("cms/blog-writer/topics")
@UseGuards(JwtAuthGuard, AdminGuard)
export class TopicQueueController {
    constructor(
        @InjectModel(TopicQueue.name) private readonly topicModel: Model<TopicQueueDocument>,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Body() dto: {
            title: string;
            notes?: string;
            category?: string;
            type?: string;
            priority?: number;
        },
    ) {
        return new this.topicModel({ ...dto, status: "pending" }).save();
    }

    @Get()
    findAll() {
        return this.topicModel.find().sort({ status: 1, priority: -1, createdAt: 1 }).exec();
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
        return this.topicModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
    }

    @Patch(":id/reset")
    async reset(@Param("id") id: string) {
        return this.topicModel
            .findByIdAndUpdate(
                id,
                { $set: { status: "pending", error: undefined, generatedPost: undefined } },
                { new: true },
            )
            .exec();
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.topicModel.findByIdAndDelete(id).exec();
    }
}

// --- Scheduler Config ---
@Controller("cms/blog-writer/scheduler")
@UseGuards(JwtAuthGuard, AdminGuard)
export class SchedulerConfigController {
    constructor(
        @InjectModel(SchedulerConfig.name)
        private readonly configModel: Model<SchedulerConfigDocument>,
    ) {}

    @Get()
    async getConfig() {
        let config = await this.configModel.findOne().exec();
        if (!config) {
            config = await new this.configModel({
                enabled: false,
                interval: "daily",
                categoryRotation: [],
                lastCategoryIndex: 0,
            }).save();
        }
        return config;
    }

    @Put()
    async updateConfig(
        @Body() dto: {
            enabled?: boolean;
            interval?: string;
            defaultTone?: string;
            model?: string;
            includeDiagrams?: boolean;
            includeCharts?: boolean;
            includePlaygrounds?: boolean;
            includeComparisonTables?: boolean;
            categoryRotation?: string[];
        },
    ) {
        let config = await this.configModel.findOne().exec();
        if (!config) {
            config = new this.configModel({
                enabled: false,
                interval: "daily",
                categoryRotation: [],
                lastCategoryIndex: 0,
            });
        }
        if (dto.enabled !== undefined) config.enabled = dto.enabled;
        if (dto.interval) config.interval = dto.interval;
        if (dto.defaultTone !== undefined) config.defaultTone = dto.defaultTone;
        if (dto.model !== undefined) config.aiModel = dto.model;
        if (dto.includeDiagrams !== undefined) config.includeDiagrams = dto.includeDiagrams;
        if (dto.includeCharts !== undefined) config.includeCharts = dto.includeCharts;
        if (dto.includePlaygrounds !== undefined)
            config.includePlaygrounds = dto.includePlaygrounds;
        if (dto.includeComparisonTables !== undefined)
            config.includeComparisonTables = dto.includeComparisonTables;
        if (dto.categoryRotation) config.categoryRotation = dto.categoryRotation;
        return config.save();
    }
}

// --- Generate + History ---
@Controller("cms/blog-writer")
@UseGuards(JwtAuthGuard, AdminGuard)
export class BlogWriterController {
    constructor(
        @InjectModel(BlogGeneration.name)
        private readonly generationModel: Model<BlogGenerationDocument>,
        private readonly blogWriterService: BlogWriterService,
    ) {}

    @Post("generate")
    @HttpCode(HttpStatus.CREATED)
    async generate(
        @Body() dto: {
            topic: string;
            toneId?: string;
            categoryId?: string;
            type?: string;
            model?: string;
            includeDiagrams?: boolean;
            includeCharts?: boolean;
            includePlaygrounds?: boolean;
            includeComparisonTables?: boolean;
        },
    ) {
        return this.blogWriterService.generate(dto);
    }

    @Get("history")
    findHistory() {
        return this.generationModel.find().sort({ createdAt: -1 }).limit(50).exec();
    }
}
