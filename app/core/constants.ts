// Chaves de metadata. Usamos symbols para não colidir com nada do usuário.
export const CONTROLLER_METADATA = Symbol('controller:metadata');
export const ROUTES_METADATA = Symbol('controller:routes');
export const PARAMS_METADATA = Symbol('route:params');
export const MODULE_METADATA = Symbol('module:metadata');
export const INJECTABLE_METADATA = Symbol('injectable:metadata');
export const INJECT_TOKENS = Symbol('inject:tokens');

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
  pipes?: any[];
}

export interface ModuleOptions {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  exports?: any[];
}

// --- Metadata usada pelos decorators de Swagger/OpenAPI ---
export const API_TAGS_METADATA = Symbol('swagger:tags');
export const API_OPERATION_METADATA = Symbol('swagger:operation');
export const API_RESPONSE_METADATA = Symbol('swagger:responses');
export const API_PARAM_METADATA = Symbol('swagger:params');
export const API_QUERY_METADATA = Symbol('swagger:queries');
export const API_BODY_METADATA = Symbol('swagger:body');
export const API_PROPERTY_METADATA = Symbol('swagger:properties');
export const API_SECURITY_METADATA = Symbol('swagger:security');

// --- Metadata usada por guards / interceptors / pipes ---
export const GUARDS_METADATA = Symbol('guards:metadata');
export const INTERCEPTORS_METADATA = Symbol('interceptors:metadata');
export const PIPES_METADATA = Symbol('pipes:metadata');
