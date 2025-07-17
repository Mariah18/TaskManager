import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

// Data Transfer Object for user registration requests
export class RegisterDto {
  @IsEmail()
  email: string; // User's email address

  @IsString()
  @MinLength(6)
  password: string; // User's password (minimum 6 characters)

  @IsString()
  @IsOptional()
  name?: string; // Optional display name
}
