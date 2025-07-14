import { IsString, IsOptional, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;
}
