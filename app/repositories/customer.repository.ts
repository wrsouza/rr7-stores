import type { Customer } from "../../generated/prisma/client";
import type {
  CustomerCreateArgs,
  CustomerDeleteArgs,
  CustomerFindFirstArgs,
  CustomerFindManyArgs,
  CustomerUpdateArgs,
} from "../../generated/prisma/models";
import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class CustomerRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(data: CustomerFindManyArgs): Promise<Customer[]> {
    return this.prisma.customer.findMany(data);
  }

  async findOne(data: CustomerFindFirstArgs): Promise<Customer | null> {
    return this.prisma.customer.findFirst(data);
  }

  async createOne(data: CustomerCreateArgs): Promise<Customer> {
    return this.prisma.customer.create(data);
  }

  async updateOne(data: CustomerUpdateArgs): Promise<Customer> {
    return this.prisma.customer.update(data);
  }

  async deleteOne(data: CustomerDeleteArgs): Promise<void> {
    await this.prisma.customer.delete(data);
  }
}
