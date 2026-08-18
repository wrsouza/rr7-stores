import { Module } from "../../core/decorators";
import { StoreRepository } from "../../repositories";
import { StoresController } from "./stores.controller";
import { StoresService } from "./stores.service";

@Module({
  controllers: [StoresController],
  providers: [StoresService, StoreRepository],
})
export class StoresModule {}
