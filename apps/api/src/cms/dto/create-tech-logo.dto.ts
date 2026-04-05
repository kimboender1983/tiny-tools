import { IsArray, IsIn, IsOptional, IsString } from "class-validator";

export class CreateTechLogoDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsArray()
    @IsString({ each: true })
    paths!: string[];

    @IsString()
    color!: string;

    @IsOptional()
    @IsString()
    bgColor?: string;

    @IsOptional()
    @IsString()
    viewBox?: string;

    @IsOptional()
    @IsIn(["evenodd", "nonzero"])
    fillRule?: string;

    @IsOptional()
    @IsIn(["manual", "simple-icons"])
    source?: string;
}
