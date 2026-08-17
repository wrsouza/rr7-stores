import 'reflect-metadata';
import { API_PARAM_METADATA, API_QUERY_METADATA, API_BODY_METADATA } from '../../constants';

export interface ApiParamOptions {
  name: string;
  description?: string;
  type?: any;
  required?: boolean;
  enum?: any[];
}

export interface ApiQueryOptions {
  name: string;
  description?: string;
  type?: any;
  required?: boolean;
  enum?: any[];
}

export interface ApiBodyOptions {
  type: any;
  description?: string;
  isArray?: boolean;
}

function pushMetadata(key: symbol, target: any, propertyKey: string | symbol, value: any) {
  const existing: any[] = Reflect.getMetadata(key, target.constructor, propertyKey) || [];
  existing.push(value);
  Reflect.defineMetadata(key, existing, target.constructor, propertyKey);
}

/**
 * Documenta um parâmetro de rota (:id). Complementa (não substitui) o que já
 * é detectado automaticamente a partir do próprio @Param do handler — use
 * para adicionar description/type/enum.
 */
export function ApiParam(options: ApiParamOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    pushMetadata(API_PARAM_METADATA, target, propertyKey, options);
    return descriptor;
  };
}

/** Documenta um parâmetro de querystring. Mesmo raciocínio do @ApiParam. */
export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    pushMetadata(API_QUERY_METADATA, target, propertyKey, options);
    return descriptor;
  };
}

/** Descreve o corpo esperado da requisição a partir de um DTO decorado com @ApiProperty. */
export function ApiBody(options: ApiBodyOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(API_BODY_METADATA, options, target.constructor, propertyKey);
    return descriptor;
  };
}
