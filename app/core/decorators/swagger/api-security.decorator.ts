import 'reflect-metadata';
import { API_SECURITY_METADATA } from '../../constants';

/** Um item do `security` da operação: { [schemeName]: scopes[] }. */
export type SecurityRequirement = Record<string, string[]>;

/**
 * Marca que a rota (ou todas as rotas do controller) exige o security scheme
 * `name`, que precisa ter sido registrado no DocumentBuilder
 * (addApiKey/addBearerAuth). Mesma API do @ApiSecurity do @nestjs/swagger.
 *
 * Aplicado na classe, vale para todos os handlers; aplicado no método, soma-se
 * ao que veio da classe. Só documenta — quem barra a request continua sendo o
 * guard (@UseGuards).
 */
export function ApiSecurity(name: string, requirements: string[] = []): ClassDecorator & MethodDecorator {
  return ((target: any, propertyKey?: string | symbol, descriptor?: any) => {
    const requirement: SecurityRequirement = { [name]: requirements };

    if (propertyKey === undefined) {
      // decorator de classe: `target` já é o próprio constructor
      pushRequirement(target, requirement);
      return target;
    }

    // decorator de método: `target` é o prototype
    pushRequirement(target.constructor, requirement, propertyKey);
    return descriptor;
  }) as ClassDecorator & MethodDecorator;
}

/** Atalho para o scheme bearer registrado com addBearerAuth(). */
export const ApiBearerAuth = (name = 'bearer') => ApiSecurity(name);

function pushRequirement(
  controllerClass: any,
  requirement: SecurityRequirement,
  propertyKey?: string | symbol
) {
  const existing: SecurityRequirement[] =
    (propertyKey === undefined
      ? Reflect.getOwnMetadata(API_SECURITY_METADATA, controllerClass)
      : Reflect.getOwnMetadata(API_SECURITY_METADATA, controllerClass, propertyKey)) || [];

  // decorators são aplicados de baixo pra cima; unshift mantém a ordem de escrita
  const merged = [requirement, ...existing];

  if (propertyKey === undefined) {
    Reflect.defineMetadata(API_SECURITY_METADATA, merged, controllerClass);
  } else {
    Reflect.defineMetadata(API_SECURITY_METADATA, merged, controllerClass, propertyKey);
  }
}
