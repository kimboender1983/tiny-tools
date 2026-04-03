import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').sort({ createdAt: -1 }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIdSafe(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  async update(
    id: string,
    data: { email?: string; name?: string; role?: string; plan?: string; avatar?: string },
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .select('-passwordHash')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 12);
    const result = await this.userModel.findByIdAndUpdate(id, { $set: { passwordHash: hash } }).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { $set: { passwordHash } }).exec();
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    plan: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }): Promise<UserDocument> {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = new this.userModel({
      email: data.email,
      passwordHash,
      name: data.name || '',
      role: data.role || 'admin',
      plan: 'free',
    });
    const saved = await user.save();
    return this.userModel.findById(saved._id).select('-passwordHash').exec() as Promise<UserDocument>;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
