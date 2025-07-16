import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Matches(/^(?!\s*$).+/, { message: "Name must not be empty or whitespace" })
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
