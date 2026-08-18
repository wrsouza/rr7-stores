import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { BadRequestException, NotFoundException } from "../../core/exceptions";
import { StoreRepository } from "../../repositories";
import {
  type StoreCreateInput,
  StoreDto,
  type StoreUpdateInput,
} from "./dtos";

@Injectable()
export class StoresService {
  constructor(
    @Inject(StoreRepository) private readonly repository: StoreRepository,
  ) {}

  async findAll(): Promise<StoreDto[]> {
    const stores = await this.repository.findMany({});
    return stores.map((store) => new StoreDto(store));
  }

  async findOne(id: string): Promise<StoreDto> {
    const store = await this.findById(id);
    return new StoreDto(store);
  }

  async createOne(data: StoreCreateInput): Promise<StoreDto> {
    await this.checkNameExist(data.name);
    const store = await this.repository.createOne({
      data: { name: data.name },
    });

    return new StoreDto(store);
  }

  async updateOne(id: string, data: StoreUpdateInput): Promise<StoreDto> {
    await this.findById(id);

    if (data.name) {
      await this.checkNameExist(data.name, id);
    }

    const updatedStore = await this.repository.updateOne({
      where: { id },
      data,
    });

    return new StoreDto(updatedStore);
  }

  async deleteOne(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteOne({
      where: { id },
    });
  }

  private async findById(id: string) {
    const store = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!store) {
      throw new NotFoundException("Store not found");
    }
    return store;
  }

  private async checkNameExist(name: string, id?: string): Promise<void> {
    const store = await this.repository.findOne({
      where: {
        ...(id ? { id: { not: id } } : {}),
        name,
      },
    });

    if (store) {
      throw new BadRequestException("Store name already exist");
    }
  }
}
