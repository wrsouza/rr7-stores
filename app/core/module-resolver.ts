import 'reflect-metadata';
import { MODULE_METADATA, type DynamicModule, type ModuleImport, type ModuleOptions } from './constants';
import { Container } from './container';

function isDynamicModule(moduleRef: ModuleImport): moduleRef is DynamicModule {
  return typeof moduleRef === 'object' && moduleRef !== null;
}

/**
 * Resolve as ModuleOptions efetivas de um import: para uma classe estática é
 * só a metadata do @Module(); para um dynamic module (retorno de
 * forRoot()/forFeature()/register()) é a metadata estática da classe base
 * (`.module`) somada ao que veio configurado no objeto retornado.
 */
function resolveMeta(moduleRef: ModuleImport): ModuleOptions {
  if (!isDynamicModule(moduleRef)) {
    return Reflect.getMetadata(MODULE_METADATA, moduleRef) || {};
  }

  const staticMeta: ModuleOptions = Reflect.getMetadata(MODULE_METADATA, moduleRef.module) || {};
  return {
    imports: [...(staticMeta.imports ?? []), ...(moduleRef.imports ?? [])],
    controllers: [...(staticMeta.controllers ?? []), ...(moduleRef.controllers ?? [])],
    providers: [...(staticMeta.providers ?? []), ...(moduleRef.providers ?? [])],
    exports: [...(staticMeta.exports ?? []), ...(moduleRef.exports ?? [])],
    global: moduleRef.global ?? staticMeta.global,
  };
}

/**
 * Percorre a árvore de módulos (imports) recursivamente, registrando
 * providers e controllers no container. Retorna a lista de controllers
 * encontrados, para o Router construir as rotas.
 *
 * `visited` desduplica por referência: uma classe estática só é visitada uma
 * vez (igual ao Nest), enquanto cada dynamic module (objeto novo a cada
 * chamada de forRoot()/forFeature()/register()) é tratado como uma instância
 * própria — a menos que o mesmo objeto retornado seja reaproveitado pelo
 * chamador em mais de um import.
 */
export function resolveModule(
  moduleRef: ModuleImport,
  container: Container,
  controllersOut: any[] = [],
  visited = new Set<any>()
): any[] {
  if (visited.has(moduleRef)) return controllersOut;
  visited.add(moduleRef);

  const meta = resolveMeta(moduleRef);

  for (const imported of meta.imports ?? []) {
    resolveModule(imported, container, controllersOut, visited);
  }

  container.registerModule(moduleRef, meta);
  controllersOut.push(...(meta.controllers ?? []));

  return controllersOut;
}
