import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../auth/guards/admin.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("cms/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(":id")
    async findById(@Param("id") id: string) {
        const user = await this.usersService.findByIdSafe(id);
        if (!user) throw new BadRequestException("User not found");
        return user;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() body: { email: string; password: string; name?: string; role?: string }) {
        if (!body.email || !body.password) {
            throw new BadRequestException("Email and password are required");
        }
        if (body.password.length < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        const existing = await this.usersService.findByEmail(body.email);
        if (existing) {
            throw new BadRequestException("A user with this email already exists");
        }
        return this.usersService.createUser(body);
    }

    @Put(":id")
    update(
        @Param("id") id: string,
        @Body() body: {
            email?: string;
            name?: string;
            role?: string;
            plan?: string;
            avatar?: string;
        },
    ) {
        return this.usersService.update(id, body);
    }

    @Patch(":id/password")
    @HttpCode(HttpStatus.NO_CONTENT)
    async changePassword(@Param("id") id: string, @Body() body: { password: string }) {
        if (!body.password || body.password.length < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        await this.usersService.changePassword(id, body.password);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.usersService.delete(id);
    }
}
