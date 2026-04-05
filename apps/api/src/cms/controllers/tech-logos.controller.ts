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
import { CreateTechLogoDto } from "../dto/create-tech-logo.dto";
import { UpdateTechLogoDto } from "../dto/update-tech-logo.dto";
import { TechLogosService } from "../services/tech-logos.service";

@Controller("cms/tech-logos")
@UseGuards(JwtAuthGuard, AdminGuard)
export class TechLogosController {
    constructor(private readonly techLogosService: TechLogosService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateTechLogoDto) {
        return this.techLogosService.create(dto);
    }

    @Get()
    findAll() {
        return this.techLogosService.findAll();
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.techLogosService.findById(id);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: UpdateTechLogoDto) {
        return this.techLogosService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.techLogosService.delete(id);
    }
}
