import 'reflect-metadata';
import { CONTROLLER_METADATA, ROUTES_METADATA, RouteDefinitionMeta, HttpMethod } from './constants';

export interface CompiledRoute {
  method: HttpMethod;
  regex: RegExp;
  paramNames: string[];
  controllerClass: any;
  handlerName: string | symbol;
}

function pathToRegex(path: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const pattern = path
    .replace(/\/+$/, '') // remove barra final
    .replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    });

  return { regex: new RegExp(`^${pattern || '/'}$`), paramNames };
}

export function buildRoutes(controllers: any[]): CompiledRoute[] {
  const routes: CompiledRoute[] = [];

  for (const controllerClass of controllers) {
    const controllerMeta = Reflect.getMetadata(CONTROLLER_METADATA, controllerClass);
    if (!controllerMeta) continue; // não é um controller (é um provider comum)

    const routeDefs: RouteDefinitionMeta[] =
      Reflect.getMetadata(ROUTES_METADATA, controllerClass) || [];

    for (const def of routeDefs) {
      const fullPath = `${controllerMeta.prefix}${def.path}` || '/';
      const { regex, paramNames } = pathToRegex(fullPath);
      routes.push({
        method: def.method,
        regex,
        paramNames,
        controllerClass,
        handlerName: def.handlerName,
      });
    }
  }

  return routes;
}
