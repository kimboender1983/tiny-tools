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
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiKeysService } from "../services/api-keys.service";

@Controller("cms/api-keys")
@UseGuards(JwtAuthGuard, AdminGuard)
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: { name: string; permissions?: string[] }) {
        return this.apiKeysService.create(dto.name, dto.permissions);
    }

    @Get()
    findAll() {
        return this.apiKeysService.findAll();
    }

    @Patch(":id/toggle")
    toggleActive(@Param("id") id: string) {
        return this.apiKeysService.toggleActive(id);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.apiKeysService.delete(id);
    }
}
