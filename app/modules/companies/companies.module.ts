import { Module } from "../../core/decorators";
import { CompanyRepository, StoreRepository } from "../../repositories";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyRepository, StoreRepository],
})
export class CompaniesModule {}
