import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryFilterDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    pageSize?: number;

    @IsOptional()
    @IsIn(["draft", "published", "archived"])
    status?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: string = "createdAt";

    @IsOptional()
    @IsIn(["asc", "desc"])
    sortOrder?: "asc" | "desc" = "desc";
}
