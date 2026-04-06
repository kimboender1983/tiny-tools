import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { CmsModule } from "./cms/cms.module";
import configuration from "./config/configuration";
import { HealthModule } from "./health/health.module";
import { PublicContentModule } from "./public-content/public-content.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: [".env", "apps/api/.env"],
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>("mongoUrl"),
            }),
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        CmsModule,
        PublicContentModule,
        HealthModule,
    ],
})
export class AppModule {}
