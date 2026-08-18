import { BcryptService } from "../../common/services";
import { Module } from "../../core/decorators";
import { UserRepository } from "../../repositories";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository, BcryptService],
})
export class UsersModule {}
