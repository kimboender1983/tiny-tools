import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: true,
    });

    // Increase body size limit for media uploads (base64 images in dev, etc.)
    const expressApp = app.getHttpAdapter().getInstance();
    const bodyParser = require("body-parser");
    expressApp.use(bodyParser.json({ limit: "50mb" }));
    expressApp.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

    const configService = app.get(ConfigService);
    const frontendUrl = configService.get<string>("frontendUrl", "http://localhost:3000");
    const port = configService.get<number>("port", 3001);

    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });

    // Swagger API docs
    const swaggerConfig = new DocumentBuilder()
        .setTitle("Pickbox API")
        .setDescription("Blog post creation API for external integrations")
        .setVersion("1.0")
        .addBearerAuth({ type: "http", scheme: "bearer", description: "API key (pb_xxx...)" }, "api-key")
        .addTag("Blog API", "Create and manage blog posts via API key")
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        include: [],
        deepScanRoutes: true,
    });
    SwaggerModule.setup("docs", app, document);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
}

bootstrap();
