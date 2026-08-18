import { Inject, Injectable } from "../core/decorators/injectable.decorator";
import { UnauthorizedException } from "../core/exceptions";
import { type CanActivate, ExecutionContext } from "../core/interfaces";
import { JwtService } from "./services";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.getRequest();
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não informado");
    }

    const token = authorization.slice("Bearer ".length);
    this.jwt.verify(token);
    return true;
  }
}
