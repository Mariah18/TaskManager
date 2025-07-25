import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { GetTasksDto } from "./dto/get-tasks.dto";

// Service responsible for all business logic related to tasks
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Create a new task for a user
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const now = new Date();
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        dueDate: createTaskDto.dueDate ?? now,
        priority: createTaskDto.priority ?? "low",
      },
    });
  }

  // Get all tasks for a user, with support for filtering, sorting, and pagination
  async findAll(getTasksDto: GetTasksDto, userId: string) {
    const {
      page = 1,
      limit = 10,
      completed,
      search,
      sortBy = "createdAt",
    } = getTasksDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (completed !== undefined) {
      where.completed = completed;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Build orderBy clause with fixed order
    let orderBy: any;
    const validSortFields = [
      "title",
      "createdAt",
      "completed",
      "updatedAt",
      "dueDate",
      "priority",
    ];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    if (safeSortBy === "priority") {
      orderBy = [{ priority: "desc" }];
    } else if (safeSortBy === "completed") {
      orderBy = [{ completed: "desc" }, { createdAt: "desc" }];
    } else if (safeSortBy === "title") {
      orderBy = [{ title: "asc" }];
    } else if (safeSortBy === "dueDate") {
      orderBy = [{ dueDate: "asc" }];
    } else {
      orderBy = [{ [safeSortBy]: "desc" }];
    }

    let [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    // Case-insensitive sort by title in JS if sorting by title
    if (safeSortBy === "title") {
      tasks = tasks.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
    }
    // Custom sort by priority: high > medium > low
    if (safeSortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      tasks = tasks.sort(
        (a, b) =>
          (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      );
    }
    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get a single task by ID for a user
  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }
    if (task.userId !== userId) {
      throw new ForbiddenException();
    }
    return task;
  }

  // Update a task by ID for a user
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException();
    if (task.userId !== userId) throw new ForbiddenException();
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  // Delete a task by ID for a user
  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException();
    if (task.userId !== userId) throw new ForbiddenException();
    return this.prisma.task.delete({ where: { id } });
  }

  // Toggle the completion status of a task
  async toggleComplete(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!task) throw new NotFoundException();
    if (task.userId !== userId) throw new ForbiddenException();
    return this.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }
}
