import 'reflect-metadata';
import { MODULE_METADATA, type ModuleOptions } from './constants';
import { Container } from './container';

/**
 * Percorre a árvore de módulos (imports) recursivamente, registrando
 * providers e controllers no container. Retorna a lista de controllers
 * encontrados, para o Router construir as rotas.
 */
export function resolveModule(
  moduleClass: any,
  container: Container,
  controllersOut: any[] = [],
  visited = new Set<any>()
): any[] {
  if (visited.has(moduleClass)) return controllersOut;
  visited.add(moduleClass);

  const meta: ModuleOptions = Reflect.getMetadata(MODULE_METADATA, moduleClass) || {};

  for (const imported of meta.imports ?? []) {
    resolveModule(imported, container, controllersOut, visited);
  }

  for (const provider of meta.providers ?? []) {
    container.registerProvider(provider);
  }

  for (const controller of meta.controllers ?? []) {
    container.registerProvider(controller); // controller também pode ter dependências injetadas
    controllersOut.push(controller);
  }

  return controllersOut;
}
