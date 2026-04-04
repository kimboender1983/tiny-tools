import { IsOptional, IsString } from "class-validator";

export class CreateAuthorDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}
