import { type CanActivate, ExecutionContext } from '../core/interfaces';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.getRequest();
    return request.headers.get('x-api-key') === 'secret';
  }
}
