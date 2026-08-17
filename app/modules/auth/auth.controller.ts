import { LoggingInterceptor } from "../../common/logging.interceptor";
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseInterceptors,
} from "../../core/decorators";
import { ApiTags } from "../../core/swagger";
import { AUTH_SERVICE } from "./auth.constant";
import type {
  AuthLoginDataDto,
  AuthLoginResultDto,
  AuthValidateTokenResultDto,
} from "./dtos";

import type { IAuthService } from "./interfaces";

@ApiTags("auth")
@Controller("auth")
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly service: IAuthService,
  ) {}

  @Post()
  async login(@Body() data: AuthLoginDataDto): Promise<AuthLoginResultDto> {
    return this.service.login(data);
  }

  @Get()
  async validateToken(): Promise<AuthValidateTokenResultDto> {
    return this.service.validateToken();
  }
}
