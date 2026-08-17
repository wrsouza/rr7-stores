import { Module } from "../../core/decorators";
import { AUTH_SERVICE } from "./auth.constant";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
