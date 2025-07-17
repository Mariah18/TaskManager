import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

// Entry point for the backend application
async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Set up global validation for all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: false, // Ignore extra fields instead of throwing
      transform: true, // Automatically transform payloads to DTO instances
      forbidUnknownValues: false, // Allow unknown values (for flexibility)
    })
  );

  // Prefix all routes with /api
  app.setGlobalPrefix("api");

  // Start the server on the specified port
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
