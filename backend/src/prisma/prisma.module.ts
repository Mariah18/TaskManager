import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Provides the PrismaService globally for database access throughout the app
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
