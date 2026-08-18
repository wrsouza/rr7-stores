import { BcryptService } from "../../common/services";
import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { BadRequestException, NotFoundException } from "../../core/exceptions";
import { CompanyRepository, CustomerRepository } from "../../repositories";
import {
  type CustomerCreateInput,
  CustomerDto,
  type CustomerUpdateInput,
} from "./dtos";

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomerRepository)
    private readonly repository: CustomerRepository,
    @Inject(CompanyRepository)
    private readonly companyRepository: CompanyRepository,
    @Inject(BcryptService) private readonly bcrypt: BcryptService,
  ) {}

  async findAll(): Promise<CustomerDto[]> {
    const customers = await this.repository.findMany({});
    return customers.map((customer) => new CustomerDto(customer));
  }

  async findOne(id: string): Promise<CustomerDto> {
    const customer = await this.findById(id);
    return new CustomerDto(customer);
  }

  async createOne(data: CustomerCreateInput): Promise<CustomerDto> {
    await this.checkCompanyExist(data.companyId);
    await this.checkEmailExist(data.email);
    const passwordHash = this.bcrypt.hashSync(data.password);
    const customer = await this.repository.createOne({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email,
        password: passwordHash,
        isActive: data.isActive,
      },
    });

    return new CustomerDto(customer);
  }

  async updateOne(
    id: string,
    data: CustomerUpdateInput,
  ): Promise<CustomerDto> {
    await this.findById(id);

    if (data.companyId) {
      await this.checkCompanyExist(data.companyId);
    }

    if (data.email) {
      await this.checkEmailExist(data.email, id);
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = this.bcrypt.hashSync(data.password);
    }

    const updatedCustomer = await this.repository.updateOne({
      where: { id },
      data: updateData,
    });

    return new CustomerDto(updatedCustomer);
  }

  async deleteOne(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteOne({
      where: { id },
    });
  }

  private async findById(id: string) {
    const customer = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

  private async checkEmailExist(email: string, id?: string): Promise<void> {
    const customer = await this.repository.findOne({
      where: {
        ...(id ? { id: { not: id } } : {}),
        email,
      },
    });

    if (customer) {
      throw new BadRequestException("E-mail already exist");
    }
  }

  private async checkCompanyExist(companyId: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException("Company not found");
    }
  }
}
