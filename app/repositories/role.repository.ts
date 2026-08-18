import type { Role } from "../../generated/prisma/client";
import type {
  RoleCreateArgs,
  RoleDeleteArgs,
  RoleFindFirstArgs,
  RoleFindManyArgs,
  RoleUpdateArgs,
} from "../../generated/prisma/models";
import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class RoleRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(data: RoleFindManyArgs): Promise<Role[]> {
    return this.prisma.role.findMany(data);
  }

  async findOne(data: RoleFindFirstArgs): Promise<Role | null> {
    return this.prisma.role.findFirst(data);
  }

  async createOne(data: RoleCreateArgs): Promise<Role> {
    return this.prisma.role.create(data);
  }

  async updateOne(data: RoleUpdateArgs): Promise<Role> {
    return this.prisma.role.update(data);
  }

  async deleteOne(data: RoleDeleteArgs): Promise<void> {
    await this.prisma.role.delete(data);
  }
}
