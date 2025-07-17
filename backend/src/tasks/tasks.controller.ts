import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TasksService } from "./tasks.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { GetTasksDto } from "./dto/get-tasks.dto";

// Handles HTTP requests related to tasks (CRUD, filtering, sorting, etc.)
@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task for the authenticated user
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  // Get all tasks for the authenticated user, with optional filters and pagination
  @Get()
  async findAll(@Query() query: GetTasksDto, @Request() req) {
    return this.tasksService.findAll(query, req.user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  // Update a specific task by ID for the authenticated user
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  // Delete a specific task by ID for the authenticated user
  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  // Mark a task as complete/incomplete
  @Patch(":id/complete")
  async toggleComplete(@Param("id") id: string, @Request() req) {
    return this.tasksService.toggleComplete(id, req.user.id);
  }
}
