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
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CategoriesService } from "../services/categories.service";

@Controller("cms/categories")
@UseGuards(JwtAuthGuard, AdminGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: Record<string, unknown>) {
        return this.categoriesService.create(dto);
    }

    @Get()
    async findAll() {
        const items = await this.categoriesService.findAll();
        return {
            items,
            total: items.length,
            page: 1,
            pageSize: items.length,
        };
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.categoriesService.findById(id);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.categoriesService.delete(id);
    }
}
