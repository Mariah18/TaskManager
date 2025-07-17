import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

// Service responsible for all business logic related to users
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create a new user in the database
  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Find a user by email address
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find a user by ID
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Update a user's profile information
  async update(
    id: string,
    updateUserDto: Partial<{ name?: string; email?: string; password?: string }>
  ) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
