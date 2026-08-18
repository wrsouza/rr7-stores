import type { ZodType } from 'zod';

// Chaves de metadata. Usamos symbols para não colidir com nada do usuário.
export const CONTROLLER_METADATA = Symbol.for('controller:metadata');
export const ROUTES_METADATA = Symbol.for('controller:routes');
export const PARAMS_METADATA = Symbol.for('route:params');
export const MODULE_METADATA = Symbol.for('module:metadata');
export const INJECTABLE_METADATA = Symbol.for('injectable:metadata');
export const INJECT_TOKENS = Symbol.for('inject:tokens');

export enum ParamType {
  PARAM = 'PARAM',
  BODY = 'BODY',
  QUERY = 'QUERY',
  HEADERS = 'HEADERS',
  REQ = 'REQ',
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RouteDefinitionMeta {
  method: HttpMethod;
  path: string;
  handlerName: string | symbol;
}

export interface ParamMeta {
  index: number;
  type: ParamType;
  key?: string;
  /**
   * Classe de DTO ou schema Zod passado em @Body(Dto|schema)/@Query(Dto|schema).
   * Usado pelo SwaggerModule para gerar o schema e pelo ZodValidationPipe
   * (quando for um schema Zod) para validar o argumento.
   */
  dtoType?: Type<any> | ZodType;
  pipes?: any[];
}

/** Mesmo papel do Type<T> do @nestjs/common: qualquer classe (construtora). */
export type Type<T = any> = { new (...args: any[]): T };

/** Token de injeção: a própria classe, ou um valor arbitrário (string/symbol) associado via @Inject/provide. */
export type InjectionToken = Type<any> | string | symbol;

export interface ModuleOptions {
  /** Outros módulos (classe estática ou dynamic module) cujos providers exportados ficam visíveis neste módulo. */
  imports?: ModuleImport[];
  controllers?: Type<any>[];
  providers?: Provider[];
  /**
   * Providers (por token) ou módulos inteiros (re-export) que este módulo
   * disponibiliza para quem o importar. Mesma regra do Nest: só é visível
   * para fora quem estiver aqui — declarar em "providers" não basta.
   */
  exports?: InjectionToken[];
  /**
   * Mesma ideia do @Global() do Nest: quando true, os providers exportados
   * ficam visíveis em qualquer módulo da aplicação, mesmo sem estar em
   * "imports". Usado tipicamente pelo forRoot() de módulos de
   * infra/configuração (ex: conexão de banco), que devem existir uma única
   * vez na aplicação inteira.
   */
  global?: boolean;
}

/**
 * Retorno de um forRoot()/forFeature()/register() — mesma ideia do
 * DynamicModule do Nest (https://docs.nestjs.com/modules#dynamic-modules):
 * um módulo "normal" (com @Module() na classe) mais as opções resolvidas em
 * runtime a partir dos argumentos passados pelo chamador.
 */
export interface DynamicModule extends ModuleOptions {
  /** Classe com @Module() que serve de identidade para este dynamic module. */
  module: Type<any>;
}

/** O que pode aparecer em `imports`: uma classe de módulo estática, ou um dynamic module já configurado. */
export type ModuleImport = Type<any> | DynamicModule;

// --- Custom providers (mesma ideia do https://docs.nestjs.com/fundamentals/custom-providers) ---

/** Forma "curta": a própria classe funciona como token e como implementação. */
export type ClassShorthandProvider = Type<any>;

export interface ClassProvider {
  provide: InjectionToken;
  useClass: Type<any>;
}

export interface ValueProvider {
  provide: InjectionToken;
  useValue: any;
}

export interface FactoryProvider {
  provide: InjectionToken;
  useFactory: (...args: any[]) => any;
  /** Tokens resolvidos e passados, na ordem, como argumentos de useFactory. */
  inject?: InjectionToken[];
}

export interface ExistingProvider {
  provide: InjectionToken;
  /** Cria um alias: resolver `provide` retorna a mesma instância de `useExisting`. */
  useExisting: InjectionToken;
}

export type Provider = ClassShorthandProvider | ClassProvider | ValueProvider | FactoryProvider | ExistingProvider;

// --- Metadata usada pelos decorators de Swagger/OpenAPI ---
export const API_TAGS_METADATA = Symbol.for('swagger:tags');
export const API_OPERATION_METADATA = Symbol.for('swagger:operation');
export const API_RESPONSE_METADATA = Symbol.for('swagger:responses');
export const API_PARAM_METADATA = Symbol.for('swagger:params');
export const API_QUERY_METADATA = Symbol.for('swagger:queries');
export const API_BODY_METADATA = Symbol.for('swagger:body');
export const API_PROPERTY_METADATA = Symbol.for('swagger:properties');
export const API_SECURITY_METADATA = Symbol.for('swagger:security');

// --- Metadata usada por guards / interceptors / pipes ---
export const GUARDS_METADATA = Symbol.for('guards:metadata');
export const INTERCEPTORS_METADATA = Symbol.for('interceptors:metadata');
export const PIPES_METADATA = Symbol.for('pipes:metadata');

/** Metadata usada pelo @Roles(...) + RolesGuard para controle de acesso por perfil. */
export const ROLES_METADATA = Symbol.for('roles:metadata');
