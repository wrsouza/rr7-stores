import 'reflect-metadata';
import { INJECT_TOKENS, type InjectionToken, type ModuleImport, type ModuleOptions, type Provider, type Type } from './constants';

function providerToken(provider: Provider): InjectionToken {
  return typeof provider === 'function' ? provider : provider.provide;
}

function isValueProvider(provider: Provider): provider is Extract<Provider, { useValue: any }> {
  return typeof provider === 'object' && provider !== null && 'useValue' in provider;
}

function isFactoryProvider(provider: Provider): provider is Extract<Provider, { useFactory: any }> {
  return typeof provider === 'object' && provider !== null && 'useFactory' in provider;
}

function isExistingProvider(provider: Provider): provider is Extract<Provider, { useExisting: any }> {
  return typeof provider === 'object' && provider !== null && 'useExisting' in provider;
}

function isClassProvider(provider: Provider): provider is Extract<Provider, { useClass: any }> {
  return typeof provider === 'object' && provider !== null && 'useClass' in provider;
}

function describeToken(token: any): string {
  if (typeof token === 'function') return token.name || 'AnonymousClass';
  if (token && typeof token === 'object' && 'module' in token) return `${describeToken(token.module)} (dynamic)`;
  return String(token);
}

interface ModuleRecord {
  providers: Map<InjectionToken, Provider>;
  imports: ModuleImport[];
  exports: Set<InjectionToken>;
}

/**
 * Container de DI com encapsulamento por módulo, igual ao Nest:
 * cada módulo só enxerga seus próprios providers/controllers e o que os
 * módulos que ele importa explicitamente exportam (exports não é transitivo —
 * um módulo intermediário precisa reexportar para propagar adiante).
 * Suporta a forma curta (classe = token) e custom providers
 * { provide, useClass | useValue | useFactory | useExisting }.
 */
export class Container {
  // chave = classe estática do módulo, ou o objeto dynamic module retornado por
  // forRoot()/forFeature()/register() — cada um é uma "instância" própria de módulo.
  private readonly modules = new Map<any, ModuleRecord>();
  private readonly controllerOwner = new Map<Type<any>, any>();
  // instâncias singleton, agrupadas por "dono" (módulo que declarou o provider,
  // ou o módulo/escopo que disparou a criação no caso de fallback ad-hoc).
  private readonly instances = new Map<any, Map<InjectionToken, any>>();
  // providers exportados por módulos com `global: true` (mesma ideia do @Global()
  // do Nest) — resolvíveis a partir de qualquer módulo, mesmo sem import explícito.
  private readonly globalProviders = new Map<InjectionToken, any>();

  registerModule(moduleRef: any, options: ModuleOptions) {
    if (this.modules.has(moduleRef)) return;

    const providers = new Map<InjectionToken, Provider>();
    for (const provider of options.providers ?? []) {
      providers.set(providerToken(provider), provider);
    }
    for (const controller of options.controllers ?? []) {
      providers.set(controller, controller); // controller também pode ter dependências injetadas
      this.controllerOwner.set(controller, moduleRef);
    }

    this.modules.set(moduleRef, {
      providers,
      imports: options.imports ?? [],
      exports: new Set(options.exports ?? []),
    });

    if (options.global) {
      for (const token of options.exports ?? []) {
        this.globalProviders.set(token, moduleRef);
      }
    }
  }

  /** Módulo (@Module) dono de um controller, usado pela Application para resolver no escopo certo. */
  getControllerOwnerModule(controllerClass: Type<any>): any | undefined {
    return this.controllerOwner.get(controllerClass);
  }

  /** Resolve `token` dentro do escopo de `moduleClass` (próprios providers + exports dos imports + globals). */
  resolveInModule<T = any>(moduleClass: any, token: InjectionToken): T {
    const owner = this.findOwner(moduleClass, token);
    if (!owner) {
      throw new Error(
        `[nest-rr7] Não foi possível resolver "${describeToken(token)}" no contexto de "${describeToken(moduleClass)}". ` +
          `Verifique se o provider está em "providers"/"controllers" desse módulo, ou se foi incluído em ` +
          `"exports" do módulo que o declara e esse módulo está em "imports" de "${describeToken(moduleClass)}".`
      );
    }
    return this.instantiate(owner, token);
  }

  /**
   * Igual a resolveInModule(), mas com fallback: se o token não for um provider
   * conhecido em nenhum módulo alcançável, instancia direto — útil porque
   * guards/interceptors/pipes referenciados via decorator nem sempre precisam
   * estar em "providers" para funcionar.
   */
  resolveOrInstantiateInModule<T = any>(moduleClass: any, token: InjectionToken): T {
    const owner = this.findOwner(moduleClass, token);
    if (owner) return this.instantiate(owner, token);

    const scoped = this.instancesFor(moduleClass);
    if (scoped.has(token)) return scoped.get(token);

    const instance = this.instantiateClass(moduleClass, token as Type<any>, /* strict */ false);
    scoped.set(token, instance);
    return instance;
  }

  private instancesFor(scope: any): Map<InjectionToken, any> {
    let scoped = this.instances.get(scope);
    if (!scoped) {
      scoped = new Map();
      this.instances.set(scope, scoped);
    }
    return scoped;
  }

  /**
   * Acha qual módulo *declara* o token, partindo da perspectiva de `fromModule`
   * (próprio + imports exportados), com fallback final para providers globais
   * (`global: true`, ex: forRoot() de um módulo de infra) — visíveis de
   * qualquer módulo, mesmo sem import explícito.
   */
  private findOwner(fromModule: any, token: InjectionToken): any | undefined {
    const mod = this.modules.get(fromModule);
    if (mod) {
      if (mod.providers.has(token)) return fromModule;

      for (const imported of mod.imports) {
        const owner = this.resolveExported(imported, token, new Set());
        if (owner) return owner;
      }
    }

    return this.globalProviders.get(token);
  }

  /** Dentro do que `moduleRef` exporta, acha quem de fato declara o token (recursivo, sem ciclos). */
  private resolveExported(moduleRef: any, token: InjectionToken, visiting: Set<any>): any | undefined {
    if (visiting.has(moduleRef)) return undefined;
    visiting.add(moduleRef);

    const mod = this.modules.get(moduleRef);
    if (!mod) return undefined;

    if (mod.exports.has(token)) {
      if (mod.providers.has(token)) return moduleRef;
      // exportado mas não declarado aqui -> precisa vir de um dos imports deste módulo (pass-through)
      for (const imported of mod.imports) {
        const owner = this.resolveExported(imported, token, visiting);
        if (owner) return owner;
      }
    }

    // re-export do módulo inteiro: exports contém a classe/dynamic module de um import
    for (const exportedItem of mod.exports) {
      if (this.modules.has(exportedItem) && mod.imports.includes(exportedItem as any)) {
        const owner = this.resolveExported(exportedItem, token, visiting);
        if (owner) return owner;
      }
    }

    return undefined;
  }

  private instantiate(ownerModule: any, token: InjectionToken): any {
    const scoped = this.instancesFor(ownerModule);
    if (scoped.has(token)) return scoped.get(token);

    const definition = this.modules.get(ownerModule)!.providers.get(token)!;
    const instance = this.createFromDefinition(ownerModule, definition);
    scoped.set(token, instance);
    return instance;
  }

  private createFromDefinition(ownerModule: any, definition: Provider): any {
    if (isValueProvider(definition)) return definition.useValue;

    if (isFactoryProvider(definition)) {
      const deps = (definition.inject ?? []).map((depToken) => this.resolveInModule(ownerModule, depToken));
      return definition.useFactory(...deps);
    }

    if (isExistingProvider(definition)) {
      return this.resolveInModule(ownerModule, definition.useExisting);
    }

    const cls = isClassProvider(definition) ? definition.useClass : (definition as Type<any>);
    return this.instantiateClass(ownerModule, cls, /* strict */ true);
  }

  /**
   * strict=true: dependências (@Inject) precisam estar visíveis no módulo (erro no estilo Nest se não).
   * strict=false: usado para classes ad-hoc (guard/interceptor/pipe não registrados) — cai no fallback.
   */
  private instantiateClass<T = any>(scope: any, target: Type<T>, strict: boolean): T {
    const injectTokens: InjectionToken[] = Reflect.getMetadata(INJECT_TOKENS, target) || [];
    const deps = injectTokens.map((depToken) =>
      strict ? this.resolveInModule(scope, depToken) : this.resolveOrInstantiateInModule(scope, depToken)
    );
    return new target(...deps);
  }
}
