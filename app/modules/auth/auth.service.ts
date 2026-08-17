import { Injectable } from "../../core/decorators";
import {
  AuthLoginDataDto,
  AuthLoginResultDto,
  AuthValidateTokenResultDto,
} from "./dtos";

@Injectable()
export class AuthService {
  constructor() {}

  async login(data: AuthLoginDataDto): Promise<AuthLoginResultDto> {
    return Promise.resolve(new AuthLoginResultDto());
  }

  async validateToken(): Promise<AuthValidateTokenResultDto> {
    return Promise.resolve(new AuthValidateTokenResultDto());
  }
}
