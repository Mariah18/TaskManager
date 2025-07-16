import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("TasksService", () => {
  let service: TasksService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  describe("create", () => {
    it("should create a new task", async () => {
      prisma.task.create.mockResolvedValue({
        id: "1",
        title: "Test",
        userId: "u1",
      });
      const result = await service.create({ title: "Test" }, "u1");
      expect(prisma.task.create).toHaveBeenCalled();
      expect(result).toEqual({ id: "1", title: "Test", userId: "u1" });
    });
  });

  describe("findAll", () => {
    it("should return paginated tasks", async () => {
      prisma.task.findMany.mockResolvedValue([
        { id: "1", title: "A", priority: "low" },
      ]);
      prisma.task.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, limit: 10 }, "u1");
      expect(result.tasks.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("findOne", () => {
    it("should return a task if found and owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "u1",
      });
      const result = await service.findOne("1", "u1");
      expect(result).toEqual({ id: "1", userId: "u1" });
    });
    it("should throw NotFoundException if not found", async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      await expect(service.findOne("1", "u1")).rejects.toThrow(
        NotFoundException
      );
    });
    it("should throw ForbiddenException if not owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "other",
      });
      await expect(service.findOne("1", "u1")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("update", () => {
    it("should update a task if found and owned by user", async () => {
      prisma.task.findUnique.mockResolvedValue({ id: '1', userId: 'u1' });
      prisma.task.update.mockResolvedValue({ id: '1', title: 'Updated', userId: 'u1' });
      const result = await service.update('1', { title: 'Updated' }, 'u1');
      expect(result).toEqual({ id: '1', title: 'Updated', userId: 'u1' });
    });
    it("should throw NotFoundException if not found", async () => {
      prisma.task.findUnique.mockResolvedValue(null);
      await expect(
        service.update('1', { title: 'Updated' }, 'u1')
      ).rejects.toThrow(NotFoundException);
    });
    it("should throw ForbiddenException if not owned by user", async () => {
      prisma.task.findUnique.mockResolvedValue({ id: '1', userId: 'other' });
      await expect(
        service.update('1', { title: 'Updated' }, 'u1')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should delete a task if found and owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "u1",
      });
      prisma.task.delete.mockResolvedValue({
        id: "1",
        userId: "u1",
      });
      const result = await service.remove("1", "u1");
      expect(result).toEqual({ id: "1", userId: "u1" });
    });
    it("should throw NotFoundException if not found", async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      await expect(service.remove("1", "u1")).rejects.toThrow(
        NotFoundException
      );
    });
    it("should throw ForbiddenException if not owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "other",
      });
      await expect(service.remove("1", "u1")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("toggleComplete", () => {
    it("should toggle completion if found and owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "u1",
        completed: false,
      });
      prisma.task.update.mockResolvedValue({
        id: "1",
        completed: true,
        userId: "u1",
      });
      const result = await service.toggleComplete("1", "u1");
      expect(result).toEqual({ id: "1", completed: true, userId: "u1" });
    });
    it("should throw NotFoundException if not found", async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      await expect(service.toggleComplete("1", "u1")).rejects.toThrow(
        NotFoundException
      );
    });
    it("should throw ForbiddenException if not owned by user", async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: "1",
        userId: "other",
      });
      await expect(service.toggleComplete("1", "u1")).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
