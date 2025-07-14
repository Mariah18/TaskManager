import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { GetTasksDto } from "./dto/get-tasks.dto";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const now = new Date();
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
        dueDate: createTaskDto.dueDate ?? now,
      },
    });
  }

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
    ];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    if (safeSortBy === "completed") {
      // Sort by completed, then by createdAt
      orderBy = [{ completed: "desc" }, { createdAt: "desc" }];
    } else if (safeSortBy === "title") {
      orderBy = [{ title: "asc" }];
    } else if (safeSortBy === "dueDate") {
      orderBy = [{ dueDate: "desc" }];
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
    console.log(
      "Sorted tasks by title:",
      tasks.map((t) => t.title)
    );
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

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateTaskDto,
        dueDate: updateTaskDto.dueDate ?? task.createdAt,
      },
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    // Soft delete
    return this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async toggleComplete(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    return this.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }
}
