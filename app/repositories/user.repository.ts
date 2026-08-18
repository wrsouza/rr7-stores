import type { User } from "../../generated/prisma/client";
import type {
  UserCreateArgs,
  UserDeleteArgs,
  UserFindFirstArgs,
  UserFindManyArgs,
  UserUpdateArgs,
} from "../../generated/prisma/models";
import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class UserRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(data: UserFindManyArgs): Promise<User[]> {
    return this.prisma.user.findMany(data);
  }

  async findOne(data: UserFindFirstArgs): Promise<User | null> {
    return this.prisma.user.findFirst(data);
  }

  async createOne(data: UserCreateArgs): Promise<User> {
    return this.prisma.user.create(data);
  }

  async updateOne(data: UserUpdateArgs): Promise<User> {
    return this.prisma.user.update(data);
  }

  async deleteOne(data: UserDeleteArgs): Promise<void> {
    await this.prisma.user.delete(data);
  }
}
