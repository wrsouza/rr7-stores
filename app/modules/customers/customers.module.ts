import { BcryptService } from "../../common/services";
import { Module } from "../../core/decorators";
import { CompanyRepository, CustomerRepository } from "../../repositories";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomerRepository,
    CompanyRepository,
    BcryptService,
  ],
})
export class CustomersModule {}
