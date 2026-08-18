import { BcryptService, JwtService } from "../../common/services";
import { Injectable } from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import { UnauthorizedException } from "../../core/exceptions";
import { CustomerRepository, UserRepository } from "../../repositories";
import {
  type AuthLoginInput,
  AuthLoginResultDto,
  AuthValidateTokenResultDto,
} from "./dtos";
import type { JwtPayload } from "./interfaces";

interface Account {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  type: JwtPayload["type"];
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @Inject(BcryptService) private readonly bcrypt: BcryptService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async login(data: AuthLoginInput): Promise<AuthLoginResultDto> {
    const account = await this.findAccount(data.email);

    if (!account || !account.isActive) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const passwordMatches = this.bcrypt.compareSync(
      data.password,
      account.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      type: account.type,
    };
    const accessToken = this.jwt.sign(payload);
    return new AuthLoginResultDto(accessToken);
  }

  async validateToken(token: string): Promise<AuthValidateTokenResultDto> {
    const payload = this.jwt.verify<JwtPayload>(token);
    return new AuthValidateTokenResultDto(payload);
  }

  private async findAccount(email: string): Promise<Account | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      return { ...user, type: "user" };
    }

    const customer = await this.customerRepository.findOne({ where: { email } });
    if (customer) {
      return { ...customer, type: "customer" };
    }

    return null;
  }
}
