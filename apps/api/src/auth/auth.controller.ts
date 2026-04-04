import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }
        return this.authService.login(user);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    async me(@Request() req: { user: { userId: string } }) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }

    @Post("refresh")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refresh(@Request() req: { user: { userId: string; email: string } }) {
        return this.authService.refresh(req.user);
    }
}
