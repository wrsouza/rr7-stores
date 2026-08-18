import 'reflect-metadata';
import { ROLES_METADATA } from '../constants';

/**
 * Marca a role (nome exato do model Role, ex: "store_list") exigida para acessar
 * um endpoint. Usado em conjunto com o RolesGuard: @UseGuards(AuthGuard, RolesGuard).
 */
export function Roles(...roles: string[]): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(ROLES_METADATA, roles, target.constructor, propertyKey);
  };
}
