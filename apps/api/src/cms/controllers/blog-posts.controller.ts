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
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateBlogPostDto } from "../dto/create-blog-post.dto";
import { QueryFilterDto } from "../dto/query-filter.dto";
import { UpdateBlogPostDto } from "../dto/update-blog-post.dto";
import { BlogPostsService } from "../services/blog-posts.service";

@Controller("cms/blog-posts")
@UseGuards(JwtAuthGuard, AdminGuard)
export class BlogPostsController {
    constructor(private readonly blogPostsService: BlogPostsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() dto: CreateBlogPostDto) {
        return this.blogPostsService.create(dto);
    }

    @Get()
    findAll(@Query() query: QueryFilterDto) {
        return this.blogPostsService.findAll(query);
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.blogPostsService.findById(id);
    }

    @Put(":id")
    update(@Param("id") id: string, @Body() dto: UpdateBlogPostDto) {
        return this.blogPostsService.update(id, dto);
    }

    @Patch(":id/featured")
    toggleFeatured(@Param("id") id: string) {
        return this.blogPostsService.toggleFeatured(id);
    }

    @Patch(":id/featured-homepage")
    toggleFeaturedHomepage(@Param("id") id: string) {
        return this.blogPostsService.toggleFeaturedHomepage(id);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param("id") id: string) {
        await this.blogPostsService.delete(id);
    }
}
