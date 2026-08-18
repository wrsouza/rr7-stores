import type {
  AuthLoginInput,
  AuthLoginResultDto,
  AuthValidateTokenResultDto,
} from "../dtos";

export interface IAuthService {
  login(data: AuthLoginInput): Promise<AuthLoginResultDto>;
  validateToken(token: string): Promise<AuthValidateTokenResultDto>;
}
