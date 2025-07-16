import { PartialType } from "@nestjs/mapped-types";
import { CreateTaskDto } from "./create-task.dto";
import { IsOptional, IsDateString } from "class-validator";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsDateString({}, { message: "dueDate must be a valid ISO date string" })
  dueDate?: string;
}
