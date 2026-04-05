import { PartialType } from "@nestjs/mapped-types";
import { CreateTechLogoDto } from "./create-tech-logo.dto";

export class UpdateTechLogoDto extends PartialType(CreateTechLogoDto) {}
