import type { Company } from "../../generated/prisma/client";
import type {
  CompanyCreateArgs,
  CompanyDeleteArgs,
  CompanyFindFirstArgs,
  CompanyFindManyArgs,
  CompanyUpdateArgs,
} from "../../generated/prisma/models";
import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class CompanyRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(data: CompanyFindManyArgs): Promise<Company[]> {
    return this.prisma.company.findMany(data);
  }

  async findOne(data: CompanyFindFirstArgs): Promise<Company | null> {
    return this.prisma.company.findFirst(data);
  }

  async createOne(data: CompanyCreateArgs): Promise<Company> {
    return this.prisma.company.create(data);
  }

  async updateOne(data: CompanyUpdateArgs): Promise<Company> {
    return this.prisma.company.update(data);
  }

  async deleteOne(data: CompanyDeleteArgs): Promise<void> {
    await this.prisma.company.delete(data);
  }
}
