import 'reflect-metadata';
import { API_TAGS_METADATA, API_OPERATION_METADATA } from '../../constants';

/** Agrupa o controller sob uma ou mais tags no doc (mesmo papel do @ApiTags do Nest). */
export function ApiTags(...tags: string[]): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(API_TAGS_METADATA, tags, target);
  };
}

export interface ApiOperationOptions {
  summary?: string;
  description?: string;
  operationId?: string;
  deprecated?: boolean;
}

/** Descreve a operação (endpoint) no doc — resumo, descrição etc. */
export function ApiOperation(options: ApiOperationOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(API_OPERATION_METADATA, options, target.constructor, propertyKey);
    return descriptor;
  };
}
