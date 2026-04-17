import { Controller, Delete, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { BlogFeedback, BlogFeedbackDocument } from "../schemas/blog-feedback.schema";
import { BlogPost, BlogPostDocument } from "../schemas/blog-post.schema";

@Controller("cms/blog-analytics")
@UseGuards(JwtAuthGuard, AdminGuard)
export class BlogAnalyticsController {
    constructor(
        @InjectModel(BlogPost.name) private readonly blogPostModel: Model<BlogPostDocument>,
        @InjectModel(BlogFeedback.name)
        private readonly blogFeedbackModel: Model<BlogFeedbackDocument>,
    ) {}

    @Get()
    async getAnalytics(@Query("days") daysStr = "30") {
        const days = Math.min(365, Math.max(1, parseInt(daysStr, 10) || 30));
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [voteTotals, feedbackCounts, topPostsByVotes, dailyFeedbackRaw, totalFeedback] =
            await Promise.all([
                // Sum all likes/dislikes across all posts
                this.blogPostModel
                    .aggregate([
                        {
                            $group: {
                                _id: null,
                                totalLikes: { $sum: "$likes" },
                                totalDislikes: { $sum: "$dislikes" },
                            },
                        },
                    ])
                    .exec(),

                // Feedback submissions per post slug (within period)
                this.blogFeedbackModel
                    .aggregate([
                        { $match: { createdAt: { $gte: since } } },
                        { $group: { _id: "$postSlug", count: { $sum: 1 } } },
                    ])
                    .exec(),

                // Top 20 posts by likes to merge with feedback data
                this.blogPostModel
                    .find({})
                    .select("title slug likes dislikes")
                    .sort({ likes: -1 })
                    .limit(20)
                    .lean()
                    .exec(),

                // Daily feedback submissions (within period)
                this.blogFeedbackModel
                    .aggregate([
                        { $match: { createdAt: { $gte: since } } },
                        {
                            $group: {
                                _id: {
                                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                                },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { _id: 1 } },
                    ])
                    .exec(),

                // Total feedback in period
                this.blogFeedbackModel.countDocuments({ createdAt: { $gte: since } }).exec(),
            ]);

        const totalLikes = (voteTotals[0]?.totalLikes as number) ?? 0;
        const totalDislikes = (voteTotals[0]?.totalDislikes as number) ?? 0;
        const approvalRate =
            totalLikes + totalDislikes > 0
                ? Math.round((totalLikes / (totalLikes + totalDislikes)) * 100)
                : null;

        // Map feedback counts by post slug
        const feedbackMap = new Map<string, number>(
            (feedbackCounts as { _id: string; count: number }[]).map((f) => [f._id, f.count]),
        );

        // Merge posts with feedback, rank by total engagement
        const topPosts = (topPostsByVotes as { _id: unknown; title: string; slug: string; likes: number; dislikes: number }[])
            .map((p) => ({
                id: String(p._id),
                title: p.title,
                slug: p.slug,
                likes: p.likes ?? 0,
                dislikes: p.dislikes ?? 0,
                feedback: feedbackMap.get(p.slug) ?? 0,
            }))
            .sort(
                (a, b) =>
                    b.likes + b.dislikes + b.feedback - (a.likes + a.dislikes + a.feedback),
            )
            .slice(0, 10);

        // Fill every day in the range, even days with zero submissions
        const dailyMap = new Map<string, number>(
            (dailyFeedbackRaw as { _id: string; count: number }[]).map((d) => [d._id, d.count]),
        );
        const dailyFeedback: { date: string; count: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().substring(0, 10);
            dailyFeedback.push({ date: key, count: dailyMap.get(key) ?? 0 });
        }

        return {
            totalLikes,
            totalDislikes,
            totalFeedback,
            approvalRate,
            topPosts,
            dailyFeedback,
        };
    }

    @Get("feedback")
    async listFeedback(
        @Query("page") pageStr = "1",
        @Query("limit") limitStr = "25",
        @Query("postSlug") postSlug?: string,
    ) {
        const page = Math.max(1, parseInt(pageStr, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 25));
        const filter: Record<string, unknown> = {};
        if (postSlug) filter.postSlug = postSlug;

        const [items, total] = await Promise.all([
            this.blogFeedbackModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.blogFeedbackModel.countDocuments(filter).exec(),
        ]);

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    @Delete("feedback/:id")
    async deleteFeedback(@Param("id") id: string) {
        const result = await this.blogFeedbackModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException("Feedback not found");
        return { ok: true };
    }
}
