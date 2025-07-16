import {
  IsString,
  IsOptional,
  MinLength,
  IsIn,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: "dueDate must be a valid ISO date string" })
  dueDate?: string;

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  priority?: string = "low";
}
