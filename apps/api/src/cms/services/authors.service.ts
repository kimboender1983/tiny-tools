import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Author, AuthorDocument } from '../schemas/author.schema';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { UpdateAuthorDto } from '../dto/update-author.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name)
    private readonly authorModel: Model<AuthorDocument>,
  ) {}

  async create(dto: CreateAuthorDto): Promise<AuthorDocument> {
    const author = new this.authorModel(dto);
    return author.save();
  }

  async findAll(): Promise<AuthorDocument[]> {
    return this.authorModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<AuthorDocument> {
    const author = await this.authorModel.findById(id).exec();
    if (!author) {
      throw new NotFoundException(`Author with id "${id}" not found`);
    }
    return author;
  }

  async update(id: string, dto: UpdateAuthorDto): Promise<AuthorDocument> {
    const updated = await this.authorModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Author with id "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.authorModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Author with id "${id}" not found`);
    }
  }
}
