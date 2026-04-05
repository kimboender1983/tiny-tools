import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateTechLogoDto } from "../dto/create-tech-logo.dto";
import { UpdateTechLogoDto } from "../dto/update-tech-logo.dto";
import { TechLogo, TechLogoDocument } from "../schemas/tech-logo.schema";
import { SlugService } from "./slug.service";

@Injectable()
export class TechLogosService {
    constructor(
        @InjectModel(TechLogo.name)
        private readonly techLogoModel: Model<TechLogoDocument>,
        private readonly slugService: SlugService,
    ) {}

    async create(dto: CreateTechLogoDto): Promise<TechLogoDocument> {
        const slug = dto.slug
            ? await this.slugService.ensureUnique(this.slugService.generateSlug(dto.slug), this.techLogoModel)
            : await this.slugService.ensureUnique(this.slugService.generateSlug(dto.name), this.techLogoModel);
        const logo = new this.techLogoModel({ ...dto, slug });
        return logo.save();
    }

    async findAll(): Promise<TechLogoDocument[]> {
        return this.techLogoModel.find().sort({ name: 1 }).exec();
    }

    async findById(id: string): Promise<TechLogoDocument> {
        const logo = await this.techLogoModel.findById(id).exec();
        if (!logo) {
            throw new NotFoundException(`TechLogo with id "${id}" not found`);
        }
        return logo;
    }

    async findBySlug(slug: string): Promise<TechLogoDocument> {
        const logo = await this.techLogoModel.findOne({ slug }).exec();
        if (!logo) {
            throw new NotFoundException(`TechLogo with slug "${slug}" not found`);
        }
        return logo;
    }

    async update(id: string, dto: UpdateTechLogoDto): Promise<TechLogoDocument> {
        const updated = await this.techLogoModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
            .exec();
        if (!updated) {
            throw new NotFoundException(`TechLogo with id "${id}" not found`);
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        const result = await this.techLogoModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`TechLogo with id "${id}" not found`);
        }
    }
}
