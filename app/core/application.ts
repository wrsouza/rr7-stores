import 'reflect-metadata';
import {
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  PARAMS_METADATA,
  ParamType,
  PIPES_METADATA,
  type ParamMeta,
} from './constants';
import { Container } from './container';
import { ForbiddenException, HttpException, InternalServerErrorException } from './exceptions';
import type { ArgumentMetadata, CallHandler, CanActivate, ClassOrInstance, NestInterceptor, PipeTransform } from './interfaces';
import { ExecutionContext } from './interfaces';
import { resolveModule } from './module-resolver';
import { buildRoutes, type CompiledRoute } from './router';

export { HttpException } from './exceptions';

const PARAM_TYPE_TO_ARG_TYPE: Record<ParamType, ArgumentMetadata['type'] | undefined> = {
  [ParamType.PARAM]: 'param',
  [ParamType.BODY]: 'body',
  [ParamType.QUERY]: 'query',
  [ParamType.HEADERS]: 'headers',
  [ParamType.REQ]: undefined, // Request cru não passa por pipes
};

export interface ApplicationOptions {
  guards?: ClassOrInstance<CanActivate>[];
  interceptors?: ClassOrInstance<NestInterceptor>[];
  pipes?: ClassOrInstance<PipeTransform>[];
  /** Mesmo papel do app.setGlobalPrefix('api') do Nest. Pode ser setado depois via setGlobalPrefix(). */
  globalPrefix?: string;
}

export class Application {
  private readonly container = new Container();
  private routes: CompiledRoute[] = [];
  private controllers: any[] = [];
  private rootModule: any;

  private globalGuards: ClassOrInstance<CanActivate>[] = [];
  private globalInterceptors: ClassOrInstance<NestInterceptor>[] = [];
  private globalPipes: ClassOrInstance<PipeTransform>[] = [];
  private globalPrefix = '';

  private constructor() {}

  static create(rootModule: any, options: ApplicationOptions = {}): Application {
    const app = new Application();
    app.rootModule = rootModule;
    app.controllers = resolveModule(rootModule, app.container);
    app.routes = buildRoutes(app.controllers);
    app.globalGuards = options.guards ?? [];
    app.globalInterceptors = options.interceptors ?? [];
    app.globalPipes = options.pipes ?? [];
    if (options.globalPrefix) app.setGlobalPrefix(options.globalPrefix);
    return app;
  }

  /**
   * Mesmo papel do app.setGlobalPrefix('api') do Nest: registra qual prefixo
   * a rota splat do RRv7 vai consumir. Usado como valor padrão do "basePath"
   * em handle()/createReactRouterHandlers() e para o SwaggerModule montar os
   * paths corretos no documento (ex: "/api/users" em vez de "/users").
   */
  setGlobalPrefix(prefix: string) {
    const normalized = prefix.startsWith('/') ? prefix : `/${prefix}`;
    this.globalPrefix = normalized.replace(/\/$/, '');
  }

  getGlobalPrefix(): string {
    return this.globalPrefix;
  }

  /** Usado pelo SwaggerModule (e por qualquer outra ferramenta de introspecção). */
  getControllers(): any[] {
    return this.controllers;
  }

  // Mesma API do Nest (app.useGlobalGuards(...)/useGlobalInterceptors(...)/useGlobalPipes(...)),
  // caso prefira registrar depois do create() em vez de via options.
  useGlobalGuards(...guards: ClassOrInstance<CanActivate>[]) {
    this.globalGuards.push(...guards);
  }

  useGlobalInterceptors(...interceptors: ClassOrInstance<NestInterceptor>[]) {
    this.globalInterceptors.push(...interceptors);
  }

  useGlobalPipes(...pipes: ClassOrInstance<PipeTransform>[]) {
    this.globalPipes.push(...pipes);
  }

  private resolveRef<T>(ref: ClassOrInstance<T>, scopeModule: any): T {
    // já é uma instância (ex: new ValidationPipe({...})) -> usa direto.
    // é uma classe (ex: AuthGuard) -> resolve via DI (no escopo do módulo), com fallback pra instanciar direto.
    return typeof ref === 'function' ? this.container.resolveOrInstantiateInModule(scopeModule, ref as any) : ref;
  }

  /**
   * Junta refs globais (escopo: módulo raiz) com refs de decorator no controller/handler
   * (escopo: módulo dono do controller), cada uma já carregando o escopo certo pra resolveRef().
   */
  private collectRefs<T>(
    globalRefs: ClassOrInstance<T>[],
    metadataKey: symbol,
    controllerClass: any,
    handlerName: string | symbol,
    ownerModule: any
  ): Array<{ ref: ClassOrInstance<T>; scope: any }> {
    return [
      ...globalRefs.map((ref) => ({ ref, scope: this.rootModule })),
      ...((Reflect.getMetadata(metadataKey, controllerClass) || []) as ClassOrInstance<T>[]).map((ref) => ({
        ref,
        scope: ownerModule,
      })),
      ...((Reflect.getMetadata(metadataKey, controllerClass, handlerName) || []) as ClassOrInstance<T>[]).map((ref) => ({
        ref,
        scope: ownerModule,
      })),
    ];
  }

  /**
   * basePath: prefixo que a rota splat do RRv7 já consome (ex: "/api"),
   * para ser removido antes de casar contra as rotas dos controllers.
   * Se omitido, usa o que foi definido em setGlobalPrefix()/options.globalPrefix.
   */
  async handle(request: Request, basePath: string = this.globalPrefix): Promise<Response> {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (basePath && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length) || '/';
    }

    const method = request.method.toUpperCase();
    const route = this.routes.find((r) => r.method === method && r.regex.test(pathname));

    if (!route) {
      return Response.json({ message: 'Not Found' }, { status: 404 });
    }

    const match = pathname.match(route.regex)!;
    const routeParams: Record<string, string> = {};
    route.paramNames.forEach((name, i) => (routeParams[name] = match[i + 1]));

    const context = new ExecutionContext(request, route.controllerClass, route.handlerName, routeParams);
    // Escopo de resolução do controller (encapsulamento: só enxerga seus providers + exports dos imports).
    const ownerModule = this.container.getControllerOwnerModule(route.controllerClass) ?? this.rootModule;

    try {
      // 1) Guards — global -> controller -> método, na ordem, primeira negativa já barra.
      const guardRefs = this.collectRefs(this.globalGuards, GUARDS_METADATA, route.controllerClass, route.handlerName, ownerModule);
      for (const { ref, scope } of guardRefs) {
        const guard = this.resolveRef(ref, scope);
        const allowed = await guard.canActivate(context);
        if (!allowed) throw new ForbiddenException('Acesso negado');
      }

      // 2) Corpo da requisição (uma vez só, reaproveitado pelos @Body dos params)
      let body: any;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = await request.json().catch(() => undefined);
        }
      }

      // 3) Monta os argumentos do handler, aplicando pipes (global -> controller -> método -> parâmetro)
      const pipeRefs = this.collectRefs(this.globalPipes, PIPES_METADATA, route.controllerClass, route.handlerName, ownerModule);

      const paramsMeta: ParamMeta[] =
        Reflect.getMetadata(PARAMS_METADATA, route.controllerClass, route.handlerName) || [];

      const args: any[] = [];
      for (const p of paramsMeta) {
        let value: any;
        switch (p.type) {
          case ParamType.PARAM:
            value = p.key ? routeParams[p.key] : routeParams;
            break;
          case ParamType.BODY:
            value = p.key ? body?.[p.key] : body;
            break;
          case ParamType.QUERY:
            value = p.key ? url.searchParams.get(p.key) : Object.fromEntries(url.searchParams);
            break;
          case ParamType.HEADERS:
            value = p.key ? request.headers.get(p.key) : Object.fromEntries(request.headers);
            break;
          case ParamType.REQ:
            value = request;
            break;
        }

        const argType = PARAM_TYPE_TO_ARG_TYPE[p.type];
        if (argType) {
          const metadata: ArgumentMetadata = { type: argType, data: p.key, metatype: p.dtoType };
          const allPipes = [...pipeRefs, ...(p.pipes ?? []).map((ref) => ({ ref, scope: ownerModule }))];
          for (const { ref, scope } of allPipes) {
            const pipe = this.resolveRef(ref, scope);
            value = await pipe.transform(value, metadata);
          }
        }

        args[p.index] = value;
      }

      // 4) Interceptors — envolvem a chamada do handler no modelo "onion" (o primeiro da lista é o mais externo)
      const controllerInstance = this.container.resolveInModule(ownerModule, route.controllerClass);
      const finalHandler: CallHandler = {
        handle: async () => (controllerInstance as any)[route.handlerName](...args),
      };

      const interceptorRefs = this.collectRefs(
        this.globalInterceptors,
        INTERCEPTORS_METADATA,
        route.controllerClass,
        route.handlerName,
        ownerModule
      );

      let next: CallHandler = finalHandler;
      for (let i = interceptorRefs.length - 1; i >= 0; i--) {
        const interceptor = this.resolveRef(interceptorRefs[i].ref, interceptorRefs[i].scope);
        const currentNext = next;
        next = { handle: () => interceptor.intercept(context, currentNext) };
      }

      const result = await next.handle();

      if (result instanceof Response) return result;
      return Response.json(result ?? null, { status: 200 });
    } catch (err: any) {
      if (err instanceof HttpException) {
        return Response.json(
          { status: err.status, message: err.message, ...err.details },
          { status: err.status }
        );
      }
      console.error('[nest-rr7] Erro não tratado:', err);
      const fallback = new InternalServerErrorException();
      return Response.json({ message: fallback.message }, { status: fallback.status });
    }
  }
}
