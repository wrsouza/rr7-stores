import { ROLES_METADATA } from "../core/constants";
import { Inject, Injectable } from "../core/decorators/injectable.decorator";
import { ForbiddenException, UnauthorizedException } from "../core/exceptions";
import { type CanActivate, ExecutionContext } from "../core/interfaces";
import type { JwtPayload } from "../modules/auth/interfaces";
import { StoreUserRoleRepository } from "../repositories";
import { JwtService } from "./services";

/**
 * Deve rodar depois do AuthGuard (@UseGuards(AuthGuard, RolesGuard)). Lê a role
 * exigida via @Roles(...) e confere se o usuário do token tem essa role em
 * alguma loja. Handlers sem @Roles(...) passam livremente.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(StoreUserRoleRepository)
    private readonly storeUserRoleRepository: StoreUserRoleRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] =
      Reflect.getMetadata(ROLES_METADATA, context.getClass(), context.getHandler()) || [];
    if (requiredRoles.length === 0) return true;

    const request = context.getRequest();
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não informado");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = this.jwt.verify<JwtPayload>(token);

    if (payload.type !== "user") {
      throw new ForbiddenException("Acesso negado");
    }

    const hasRole = await this.storeUserRoleRepository.userHasAnyRole(payload.sub, requiredRoles);
    if (!hasRole) {
      throw new ForbiddenException("Acesso negado");
    }

    return true;
  }
}
