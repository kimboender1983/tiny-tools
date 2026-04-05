import {
    CanActivate,
    ExecutionContext,
    Injectable,
    SetMetadata,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey, ApiKeyDocument } from "../../cms/schemas/api-key.schema";

export const API_KEY_PERMISSION = "apiKeyPermission";
export const RequireApiKeyPermission = (permission: string) =>
    SetMetadata(API_KEY_PERMISSION, permission);

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        @InjectModel(ApiKey.name)
        private readonly apiKeyModel: Model<ApiKeyDocument>,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permission = this.reflector.get<string>(API_KEY_PERMISSION, context.getHandler());
        const request = context.switchToHttp().getRequest<{
            headers: Record<string, string>;
        }>();

        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith("Bearer pb_")) {
            throw new UnauthorizedException("Valid API key required");
        }

        const key = authHeader.replace("Bearer ", "");
        const apiKey = await this.apiKeyModel.findOne({ key, active: true }).exec();

        if (!apiKey) {
            throw new UnauthorizedException("Invalid or inactive API key");
        }

        if (permission && !apiKey.permissions.includes(permission)) {
            throw new UnauthorizedException(`API key lacks permission: ${permission}`);
        }

        // Update last used
        apiKey.lastUsedAt = new Date();
        await apiKey.save();

        return true;
    }
}
