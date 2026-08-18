import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { BadRequestException, NotFoundException } from "../../core/exceptions";
import { RoleRepository } from "../../repositories";
import { type RoleCreateInput, RoleDto, type RoleUpdateInput } from "./dtos";

@Injectable()
export class RolesService {
  constructor(
    @Inject(RoleRepository) private readonly repository: RoleRepository,
  ) {}

  async findAll(): Promise<RoleDto[]> {
    const roles = await this.repository.findMany({});
    return roles.map((role) => new RoleDto(role));
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.findById(id);
    return new RoleDto(role);
  }

  async createOne(data: RoleCreateInput): Promise<RoleDto> {
    await this.checkNameExist(data.name);
    const role = await this.repository.createOne({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    });

    return new RoleDto(role);
  }

  async updateOne(id: string, data: RoleUpdateInput): Promise<RoleDto> {
    await this.findById(id);

    if (data.name) {
      await this.checkNameExist(data.name, id);
    }

    const updatedRole = await this.repository.updateOne({
      where: { id },
      data,
    });

    return new RoleDto(updatedRole);
  }

  async deleteOne(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteOne({
      where: { id },
    });
  }

  private async findById(id: string) {
    const role = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!role) {
      throw new NotFoundException("Role not found");
    }
    return role;
  }

  private async checkNameExist(name: string, id?: string): Promise<void> {
    const role = await this.repository.findOne({
      where: {
        ...(id ? { id: { not: id } } : {}),
        name,
      },
    });

    if (role) {
      throw new BadRequestException("Role name already exist");
    }
  }
}
