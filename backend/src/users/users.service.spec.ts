import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe("create", () => {
    it("should create a new user", async () => {
      prisma.user.create.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        name: "Test",
      });
      const result = await service.create({
        email: "test@example.com",
        password: "pass",
        name: "Test",
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test",
      });
    });
  });

  describe("findByEmail", () => {
    it("should return user by email", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      });
      const result = await service.findByEmail("test@example.com");
      expect(result).toEqual({ id: "1", email: "test@example.com" });
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        name: "Test",
      });
      const result = await service.findById("1");
      expect(result).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Test",
      });
    });
  });

  describe("update", () => {
    it("should update user by id", async () => {
      prisma.user.update.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        name: "Updated",
      });
      const result = await service.update("1", { name: "Updated" });
      expect(result).toEqual({
        id: "1",
        email: "test@example.com",
        name: "Updated",
      });
    });
  });
});
