import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Interval } from "@nestjs/schedule";
import { Model } from "mongoose";
import { SchedulerConfig, SchedulerConfigDocument } from "../schemas/scheduler-config.schema";
import { TopicQueue, TopicQueueDocument } from "../schemas/topic-queue.schema";
import { BlogWriterService } from "./blog-writer.service";

const INTERVAL_MS: Record<string, number> = {
    "15min": 15 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class BlogSchedulerService {
    private readonly logger = new Logger(BlogSchedulerService.name);
    private running = false;

    constructor(
        @InjectModel(SchedulerConfig.name) private readonly configModel: Model<SchedulerConfigDocument>,
        @InjectModel(TopicQueue.name) private readonly topicModel: Model<TopicQueueDocument>,
        private readonly blogWriterService: BlogWriterService,
    ) {}

    // Check every minute if we need to run
    @Interval(60_000)
    async tick() {
        if (this.running) return;

        try {
            const config = await this.configModel.findOne().exec();
            if (!config?.enabled) return;

            const intervalMs = INTERVAL_MS[config.interval] || INTERVAL_MS.daily;
            const now = Date.now();
            const lastRun = config.lastRunAt ? new Date(config.lastRunAt).getTime() : 0;

            if (now - lastRun < intervalMs) return;

            this.running = true;
            await this.runScheduledGeneration(config);
        } catch (error) {
            this.logger.error(`Scheduler tick failed: ${error}`);
        } finally {
            this.running = false;
        }
    }

    private async runScheduledGeneration(config: SchedulerConfigDocument) {
        // Pick next topic from queue
        const topic = await this.topicModel
            .findOne({ status: "pending" })
            .sort({ priority: -1, createdAt: 1 })
            .exec();

        if (!topic) {
            this.logger.log("No pending topics in queue, skipping scheduled run.");
            return;
        }

        // Mark as processing
        topic.status = "processing";
        await topic.save();

        try {
            // Determine category from rotation
            let categoryId = topic.category;
            if (!categoryId && config.categoryRotation.length > 0) {
                categoryId = config.categoryRotation[config.lastCategoryIndex % config.categoryRotation.length];
                config.lastCategoryIndex = (config.lastCategoryIndex + 1) % config.categoryRotation.length;
            }

            // Generate
            const result = await this.blogWriterService.generate({
                topic: topic.title,
                toneId: config.defaultTone,
                categoryId,
                type: topic.type || "general",
                model: config.aiModel,
                includeDiagrams: config.includeDiagrams,
                includePlaygrounds: config.includePlaygrounds,
                includeComparisonTables: config.includeComparisonTables,
            });

            // Update topic
            topic.status = "completed";
            topic.generatedPost = result.postId;
            await topic.save();

            // Update scheduler
            config.lastRunAt = new Date();
            await config.save();

            this.logger.log(`Scheduled generation completed: "${topic.title}" → post ${result.postId}`);
        } catch (error) {
            topic.status = "failed";
            topic.error = error instanceof Error ? error.message : String(error);
            await topic.save();

            config.lastRunAt = new Date();
            await config.save();

            this.logger.error(`Scheduled generation failed for "${topic.title}": ${topic.error}`);
        }
    }
}
