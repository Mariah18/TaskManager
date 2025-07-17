import { IsEmail, IsString, MinLength } from "class-validator";

// Data Transfer Object for user login requests
export class LoginDto {
  @IsEmail()
  email: string; // User's email address

  @IsString()
  @MinLength(6)
  password: string; // User's password (minimum 6 characters)
}
