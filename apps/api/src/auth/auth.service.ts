import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('adminEmail');
    const adminPassword = this.configService.get<string>('adminPassword');

    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin seed',
      );
      return;
    }

    const existing = await this.usersService.findByEmail(adminEmail);
    if (existing) {
      // Update password in case it changed
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await this.usersService.updatePassword(existing._id.toString(), passwordHash);
      this.logger.log(`Admin user updated: ${adminEmail}`);
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await this.usersService.create({
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'admin',
      plan: 'free',
    });

    this.logger.log(`Admin user seeded: ${adminEmail}`);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(tokenUser: { userId: string; email: string }) {
    const user = await this.usersService.findById(tokenUser.userId);
    if (!user) {
      return null;
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
