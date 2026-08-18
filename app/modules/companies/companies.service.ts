import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { BadRequestException, NotFoundException } from "../../core/exceptions";
import { CompanyRepository, StoreRepository } from "../../repositories";
import {
  type CompanyCreateInput,
  CompanyDto,
  type CompanyUpdateInput,
} from "./dtos";

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(CompanyRepository) private readonly repository: CompanyRepository,
    @Inject(StoreRepository) private readonly storeRepository: StoreRepository,
  ) {}

  async findAll(): Promise<CompanyDto[]> {
    const companies = await this.repository.findMany({});
    return companies.map((company) => new CompanyDto(company));
  }

  async findOne(id: string): Promise<CompanyDto> {
    const company = await this.findById(id);
    return new CompanyDto(company);
  }

  async createOne(data: CompanyCreateInput): Promise<CompanyDto> {
    await this.checkStoreExist(data.storeId);
    await this.checkNameExist(data.name);
    const company = await this.repository.createOne({
      data: {
        storeId: data.storeId,
        name: data.name,
        isActive: data.isActive,
      },
    });

    return new CompanyDto(company);
  }

  async updateOne(id: string, data: CompanyUpdateInput): Promise<CompanyDto> {
    await this.findById(id);

    if (data.storeId) {
      await this.checkStoreExist(data.storeId);
    }

    if (data.name) {
      await this.checkNameExist(data.name, id);
    }

    const updatedCompany = await this.repository.updateOne({
      where: { id },
      data,
    });

    return new CompanyDto(updatedCompany);
  }

  async deleteOne(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteOne({
      where: { id },
    });
  }

  private async findById(id: string) {
    const company = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!company) {
      throw new NotFoundException("Company not found");
    }
    return company;
  }

  private async checkNameExist(name: string, id?: string): Promise<void> {
    const company = await this.repository.findOne({
      where: {
        ...(id ? { id: { not: id } } : {}),
        name,
      },
    });

    if (company) {
      throw new BadRequestException("Company name already exist");
    }
  }

  private async checkStoreExist(storeId: string): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new BadRequestException("Store not found");
    }
  }
}
