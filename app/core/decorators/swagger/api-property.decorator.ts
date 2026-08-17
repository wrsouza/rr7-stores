import 'reflect-metadata';
import { API_PROPERTY_METADATA } from '../../constants';

export interface ApiPropertyOptions {
  /** String/Number/Boolean, uma classe de DTO, um array [Tipo], ou uma string tipo 'string'|'integer'. */
  type?: any;
  example?: any;
  description?: string;
  required?: boolean;
  enum?: any[];
  nullable?: boolean;
}

/** Marca uma propriedade de DTO para entrar no schema gerado no OpenAPI. */
export function ApiProperty(options: ApiPropertyOptions = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const ctor = target.constructor;
    const existing: Record<string, ApiPropertyOptions> = Reflect.getMetadata(API_PROPERTY_METADATA, ctor) || {};
    existing[propertyKey as string] = { type: String, required: true, ...options };
    Reflect.defineMetadata(API_PROPERTY_METADATA, existing, ctor);
  };
}

/** Atalho para @ApiProperty({ required: false, ... }) — mesmo nome usado no @nestjs/swagger. */
export function ApiPropertyOptional(options: ApiPropertyOptions = {}): PropertyDecorator {
  return ApiProperty({ ...options, required: false });
}
