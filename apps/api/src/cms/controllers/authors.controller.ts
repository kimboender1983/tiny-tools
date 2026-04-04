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
import { CreateAuthorDto } from "../dto/create-author.dto";
import { UpdateAuthorDto } from "../dto/update-author.dto";
import { AuthorsService } from "../services/authors.service";

@Controller("cms/authors")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuthorsController {
    constructor(private readonly authorsService: AuthorsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateAuthorDto) {
        return this.authorsService.create(dto);
    }

    @Get()
    findAll() {
        return this.authorsService.findAll();
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.authorsService.findById(id);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: UpdateAuthorDto) {
        return this.authorsService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.authorsService.delete(id);
    }
}
