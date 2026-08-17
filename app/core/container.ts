import 'reflect-metadata';
import { INJECT_TOKENS } from './constants';

/**
 * Container de DI minimalista: escopo singleton, resolução por token de classe.
 * Não usa reflection automática de tipos (ver decorators/injectable.decorator.ts -> @Inject).
 */
export class Container {
  private readonly providers = new Set<any>();
  private readonly instances = new Map<any, any>();

  registerProvider(provider: any) {
    this.providers.add(provider);
  }

  resolve<T = any>(token: any): T {
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }

    if (!this.providers.has(token)) {
      throw new Error(
        `[nest-rr7] Provider não registrado: ${token?.name ?? String(token)}. ` +
          `Verifique se ele está em "providers" ou "controllers" de algum módulo importado.`
      );
    }

    const injectTokens: any[] = Reflect.getMetadata(INJECT_TOKENS, token) || [];
    const deps = injectTokens.map((depToken) => this.resolve(depToken));

    const instance = new token(...deps);
    this.instances.set(token, instance);
    return instance;
  }

  /**
   * Igual ao resolve(), mas com fallback: se o token (ex: um Guard/Interceptor/Pipe)
   * não foi registrado em nenhum @Module, instancia direto — útil porque no Nest
   * guards/interceptors/pipes nem sempre precisam estar em "providers" para funcionar.
   */
  resolveOrInstantiate<T = any>(token: any): T {
    if (this.instances.has(token)) return this.instances.get(token);
    if (this.providers.has(token)) return this.resolve(token);

    const injectTokens: any[] = Reflect.getMetadata(INJECT_TOKENS, token) || [];
    const deps = injectTokens.map((depToken) => this.resolveOrInstantiate(depToken));
    const instance = new token(...deps);
    this.instances.set(token, instance);
    return instance;
  }
}
