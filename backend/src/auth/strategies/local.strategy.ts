import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

// Strategy for validating username/password login
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email" });
  }

  // Validate the user's credentials
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.login({ email, password });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
