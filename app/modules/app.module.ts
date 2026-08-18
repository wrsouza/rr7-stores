import { PrismaModule } from "../config/prisma/prisma.module";
import { Module } from "../core/decorators";
import { AuthModule } from "./auth/auth.module";
import { CompaniesModule } from "./companies/companies.module";
import { CustomersModule } from "./customers/customers.module";
import { RolesModule } from "./roles/roles.module";
import { StoresModule } from "./stores/stores.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule.forRoot({
      url: process.env.DATABASE_URL!,
    }),
    AuthModule,
    UsersModule,
    StoresModule,
    RolesModule,
    CompaniesModule,
    CustomersModule,
  ],
})
export class AppModule {}
