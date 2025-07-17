import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcrypt";

// Handles HTTP requests related to user profile management
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Update the authenticated user's profile (name, email, or password)
  @Patch("me")
  async updateMe(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userId = req.user.id;
    // Reject if no updatable fields are provided
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException("No fields provided for update");
    }
    // If email is being changed, check for uniqueness
    if (updateUserDto.email) {
      const existing = await this.usersService.findByEmail(updateUserDto.email);
      if (existing && existing.id !== userId) {
        throw new BadRequestException("Email is already in use");
      }
    }
    // If password is being changed, hash it
    let updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updated = await this.usersService.update(userId, updateData);
    return updated;
  }
}
