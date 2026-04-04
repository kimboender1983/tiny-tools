import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<{
            user?: { role: string };
        }>();
        const user = request.user;

        if (!user || user.role !== "admin") {
            throw new ForbiddenException("Admin access required");
        }

        return true;
    }
}
