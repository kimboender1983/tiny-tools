import * as crypto from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey, ApiKeyDocument } from "../schemas/api-key.schema";

@Injectable()
export class ApiKeysService {
    constructor(
        @InjectModel(ApiKey.name)
        private readonly apiKeyModel: Model<ApiKeyDocument>,
    ) {}

    generateKey(): string {
        return `pb_${crypto.randomBytes(32).toString("hex")}`;
    }

    async create(name: string, permissions: string[] = ["blog:create"]): Promise<ApiKeyDocument> {
        const key = this.generateKey();
        const apiKey = new this.apiKeyModel({ name, key, permissions, active: true });
        return apiKey.save();
    }

    async findAll(): Promise<ApiKeyDocument[]> {
        return this.apiKeyModel.find().sort({ createdAt: -1 }).exec();
    }

    async findByKey(key: string): Promise<ApiKeyDocument | null> {
        return this.apiKeyModel.findOne({ key, active: true }).exec();
    }

    async validateKey(key: string, permission: string): Promise<ApiKeyDocument | null> {
        const apiKey = await this.apiKeyModel.findOne({ key, active: true }).exec();
        if (!apiKey) return null;
        if (!apiKey.permissions.includes(permission)) return null;

        // Update last used
        apiKey.lastUsedAt = new Date();
        await apiKey.save();

        return apiKey;
    }

    async toggleActive(id: string): Promise<ApiKeyDocument> {
        const apiKey = await this.apiKeyModel.findById(id).exec();
        if (!apiKey) throw new NotFoundException(`API key with id "${id}" not found`);
        apiKey.active = !apiKey.active;
        return apiKey.save();
    }

    async delete(id: string): Promise<void> {
        const result = await this.apiKeyModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException(`API key with id "${id}" not found`);
    }
}
