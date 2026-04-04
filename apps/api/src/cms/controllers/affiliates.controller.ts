import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AffiliatesService } from "../services/affiliates.service";

@Controller("cms/affiliates")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AffiliatesController {
    constructor(private readonly affiliatesService: AffiliatesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: Record<string, unknown>) {
        return this.affiliatesService.create(dto);
    }

    @Get()
    findAll() {
        return this.affiliatesService.findAll();
    }

    @Get("analytics/overview")
    getOverviewAnalytics(@Query("days") days?: string) {
        return this.affiliatesService.getOverviewAnalytics(days ? parseInt(days, 10) : 30);
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.affiliatesService.findById(id);
    }

    @Get(":id/analytics")
    getAnalytics(@Param("id") id: string, @Query("days") days?: string) {
        return this.affiliatesService.getAnalytics(id, days ? parseInt(days, 10) : 30);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
        return this.affiliatesService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.affiliatesService.delete(id);
    }
}
