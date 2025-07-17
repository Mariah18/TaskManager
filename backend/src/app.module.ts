import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { TasksModule } from "./tasks/tasks.module";
import { UsersModule } from "./users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

// The root module of the application, responsible for importing and configuring all feature modules
@Module({
  imports: [
    // Loads environment variables from .env and makes them available globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting to protect against brute-force attacks
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // Max 100 requests per minute
      },
    ]),
    // Database and feature modules
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
