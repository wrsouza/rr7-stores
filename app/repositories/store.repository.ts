import type { Store } from "../../generated/prisma/client";
import type {
  StoreCreateArgs,
  StoreDeleteArgs,
  StoreFindFirstArgs,
  StoreFindManyArgs,
  StoreUpdateArgs,
} from "../../generated/prisma/models";
import { PrismaService } from "../config/prisma/prisma.service";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class StoreRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany(data: StoreFindManyArgs): Promise<Store[]> {
    return this.prisma.store.findMany(data);
  }

  async findOne(data: StoreFindFirstArgs): Promise<Store | null> {
    return this.prisma.store.findFirst(data);
  }

  async createOne(data: StoreCreateArgs): Promise<Store> {
    return this.prisma.store.create(data);
  }

  async updateOne(data: StoreUpdateArgs): Promise<Store> {
    return this.prisma.store.update(data);
  }

  async deleteOne(data: StoreDeleteArgs): Promise<void> {
    await this.prisma.store.delete(data);
  }
}
