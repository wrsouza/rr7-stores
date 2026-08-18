import { Module } from "../../core/decorators";
import { RoleRepository } from "../../repositories";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
})
export class RolesModule {}
