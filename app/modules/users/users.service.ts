import { BcryptService } from "../../common/services";
import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { BadRequestException, NotFoundException } from "../../core/exceptions";
import { UserRepository } from "../../repositories";
import {
  type UserCreateInput,
  UserDto,
  type UserUpdateInput,
} from "./dtos";

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepository) private readonly repository: UserRepository,
    @Inject(BcryptService) private readonly bcrypt: BcryptService,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.repository.findMany({});
    return users.map((user) => new UserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.findById(id);
    return new UserDto(user);
  }

  async createOne(data: UserCreateInput): Promise<UserDto> {
    await this.checkEmailExist(data.email);
    const passwordHash = this.bcrypt.hashSync(data.password);
    const user = await this.repository.createOne({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        isActive: data.isActive,
      },
    });

    return new UserDto(user);
  }

  async updateOne(id: string, data: UserUpdateInput): Promise<UserDto> {
    await this.findById(id);

    if (data.email) {
      await this.checkEmailExist(data.email, id);
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = this.bcrypt.hashSync(data.password);
    }

    const updatedUser = await this.repository.updateOne({
      where: { id },
      data: updateData,
    });

    return new UserDto(updatedUser);
  }

  async deleteOne(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.deleteOne({
      where: { id },
    });
  }

  private async findById(id: string) {
    const user = await this.repository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private async checkEmailExist(email: string, id?: string): Promise<void> {
    const user = await this.repository.findOne({
      where: {
        ...(id ? { id: { not: id } } : {}),
        email,
      },
    });

    if (user) {
      throw new BadRequestException("E-mail already exist");
    }
  }
}
