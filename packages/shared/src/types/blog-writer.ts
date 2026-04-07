export interface IWritingTone {
    _id: string;
    name: string;
    content: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type TopicStatus = "pending" | "processing" | "completed" | "failed";
export type TopicType = "oss" | "ai" | "aff" | "general";

export interface ITopicQueue {
    _id: string;
    title: string;
    notes?: string;
    category?: string;
    type: TopicType;
    status: TopicStatus;
    priority: number;
    generatedPost?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBlogGeneration {
    _id: string;
    topic: string;
    tone?: string;
    category?: string;
    status: "success" | "failed";
    error?: string;
    createdPost?: string;
    tokensUsed?: number;
    durationMs?: number;
    createdAt: Date;
}

export interface ISchedulerConfig {
    _id: string;
    enabled: boolean;
    interval: "15min" | "30min" | "hourly" | "daily" | "weekly";
    defaultTone?: string;
    aiModel?: string;
    includeDiagrams?: boolean;
    includeCharts?: boolean;
    includePlaygrounds?: boolean;
    includeComparisonTables?: boolean;
    categoryRotation: string[];
    lastCategoryIndex: number;
    lastRunAt?: Date;
    updatedAt: Date;
}
