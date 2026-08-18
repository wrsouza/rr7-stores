import { LoggingInterceptor } from "../../common/logging.interceptor";
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  UseInterceptors,
} from "../../core/decorators";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "../../core/decorators/swagger";
import { UnauthorizedException } from "../../core/exceptions";
import { AUTH_SERVICE } from "./auth.constant";
import {
  type AuthLoginInput,
  AuthLoginResultDto,
  authLoginSchema,
  AuthValidateTokenResultDto,
} from "./dtos";
import type { IAuthService } from "./interfaces";

@ApiTags("Auth")
@Controller("auth")
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly service: IAuthService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Autentica um usuário ou cliente e retorna um JWT" })
  @ApiOkResponse({ type: AuthLoginResultDto })
  @ApiUnauthorizedResponse({ description: "Credenciais inválidas" })
  async login(
    @Body(authLoginSchema) data: AuthLoginInput,
  ): Promise<AuthLoginResultDto> {
    return this.service.login(data);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Valida o token enviado no header Authorization" })
  @ApiOkResponse({ type: AuthValidateTokenResultDto })
  @ApiUnauthorizedResponse({ description: "Token ausente, inválido ou expirado" })
  async validateToken(
    @Headers("authorization") authorization: string | null,
  ): Promise<AuthValidateTokenResultDto> {
    const token = this.extractToken(authorization);
    return this.service.validateToken(token);
  }

  private extractToken(authorization: string | null): string {
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não informado");
    }
    return authorization.slice("Bearer ".length);
  }
}
