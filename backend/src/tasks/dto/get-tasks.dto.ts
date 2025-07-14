import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class GetTasksDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  })
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["title", "createdAt", "completed", "updatedAt", "dueDate"])
  sortBy?: string;
}
