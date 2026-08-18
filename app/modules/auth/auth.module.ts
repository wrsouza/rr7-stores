import { BcryptService, JwtService } from "../../common/services";
import { Module } from "../../core/decorators";
import { CustomerRepository, UserRepository } from "../../repositories";
import { AUTH_SERVICE } from "./auth.constant";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [
    { provide: AUTH_SERVICE, useClass: AuthService },
    UserRepository,
    CustomerRepository,
    BcryptService,
    JwtService,
  ],
})
export class AuthModule {}
