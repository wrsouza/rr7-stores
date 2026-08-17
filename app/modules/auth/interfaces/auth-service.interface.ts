import type {
  AuthLoginDataDto,
  AuthLoginResultDto,
  AuthValidateTokenResultDto,
} from "../dtos";

export interface IAuthService {
  login(data: AuthLoginDataDto): Promise<AuthLoginResultDto>;
  validateToken(): Promise<AuthValidateTokenResultDto>;
}
