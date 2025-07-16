import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue("signed-jwt"),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe("validateUser", () => {
    it("should return user without password if credentials are valid", async () => {
      const user = {
        email: "test@example.com",
        password: "hashed",
        id: "1",
        name: "Test",
      };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (jest.spyOn(bcrypt, "compare") as unknown as jest.Mock).mockResolvedValue(
        true
      );
      const result = await service.validateUser("test@example.com", "password");
      expect(result).toEqual({
        email: "test@example.com",
        id: "1",
        name: "Test",
      });
    });
    it("should return null if user not found", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const result = await service.validateUser(
        "notfound@example.com",
        "password"
      );
      expect(result).toBeNull();
    });
    it("should return null if password is invalid", async () => {
      const user = { email: "test@example.com", password: "hashed" };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      (jest.spyOn(bcrypt, "compare") as unknown as jest.Mock).mockResolvedValue(
        false
      );
      const result = await service.validateUser("test@example.com", "wrong");
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access_token and user if credentials are valid", async () => {
      jest.spyOn(service, "validateUser").mockResolvedValue({
        email: "test@example.com",
        id: "1",
        name: "Test",
      });
      const result = await service.login({
        email: "test@example.com",
        password: "password",
      });
      expect(result).toEqual({
        access_token: "signed-jwt",
        user: { id: "1", email: "test@example.com", name: "Test" },
      });
    });
    it("should throw UnauthorizedException if credentials are invalid", async () => {
      jest.spyOn(service, "validateUser").mockResolvedValue(null);
      await expect(
        service.login({ email: "bad", password: "bad" })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("register", () => {
    it("should throw ConflictException if user already exists", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        email: "test@example.com",
      });
      await expect(
        service.register({
          email: "test@example.com",
          password: "password",
          name: "Test",
        })
      ).rejects.toThrow(ConflictException);
    });
    it("should create user, hash password, and return access_token", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockImplementation(async (dto) => ({
        id: "1",
        email: dto.email,
        name: dto.name,
      }));
      (jest.spyOn(bcrypt, "hash") as unknown as jest.Mock).mockResolvedValue(
        "hashed-password"
      );
      const result = await service.register({
        email: "test@example.com",
        password: "password",
        name: "Test",
      });
      expect(usersService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "hashed-password",
        name: "Test",
      });
      expect(result).toEqual({
        access_token: "signed-jwt",
        user: { id: "1", email: "test@example.com", name: "Test" },
      });
    });
  });
});
