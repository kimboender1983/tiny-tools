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
import { CreatePageDto } from "../dto/create-page.dto";
import { QueryFilterDto } from "../dto/query-filter.dto";
import { UpdatePageDto } from "../dto/update-page.dto";
import { PagesService } from "../services/pages.service";

@Controller("cms/pages")
@UseGuards(JwtAuthGuard, AdminGuard)
export class PagesController {
    constructor(private readonly pagesService: PagesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreatePageDto) {
        return this.pagesService.create(dto);
    }

    @Get()
    findAll(@Query() query: QueryFilterDto) {
        return this.pagesService.findAll(query);
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.pagesService.findById(id);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: UpdatePageDto) {
        return this.pagesService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.pagesService.delete(id);
    }
}
