import 'reflect-metadata';
import { API_PROPERTY_METADATA } from '../constants';
import type { ApiPropertyOptions } from '../decorators/swagger/api-property.decorator';

/**
 * Acumula os schemas de DTO já gerados (para não duplicar/recursar
 * infinitamente em referências circulares) e devolve os $ref usados
 * nas paths. Equivalente simplificado ao SchemaObjectFactory do Nest.
 */
export type SchemaRegistry = Map<string, any>;

function primitiveSchema(type: any): any {
  if (type === String) return { type: 'string' };
  if (type === Number) return { type: 'number' };
  if (type === Boolean) return { type: 'boolean' };
  if (typeof type === 'string') return { type }; // ex: 'integer', 'string', passado direto
  return { type: 'string' };
}

function isDtoClass(type: any): boolean {
  return typeof type === 'function' && type !== String && type !== Number && type !== Boolean;
}

export function buildSchemaForClass(cls: any, schemas: SchemaRegistry): { $ref: string } {
  const name = cls.name;
  if (!schemas.has(name)) {
    // placeholder evita loop infinito em DTOs que se referenciam entre si
    schemas.set(name, { type: 'object', properties: {} });

    const props: Record<string, ApiPropertyOptions> = Reflect.getMetadata(API_PROPERTY_METADATA, cls) || {};
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, opts] of Object.entries(props)) {
      properties[key] = propertyToSchema(opts, schemas);
      if (opts.required !== false) required.push(key);
    }

    schemas.set(name, {
      type: 'object',
      properties,
      ...(required.length ? { required } : {}),
    });
  }

  return { $ref: `#/components/schemas/${name}` };
}

function propertyToSchema(opts: ApiPropertyOptions, schemas: SchemaRegistry): any {
  const type = opts.type;
  let schema: any;

  if (Array.isArray(type)) {
    schema = { type: 'array', items: resolveSingleType(type[0], schemas) };
  } else {
    schema = resolveSingleType(type, schemas);
  }

  if (opts.description) schema.description = opts.description;
  if (opts.example !== undefined) schema.example = opts.example;
  if (opts.enum) schema.enum = opts.enum;
  if (opts.nullable) schema.nullable = true;

  return schema;
}

function resolveSingleType(type: any, schemas: SchemaRegistry): any {
  if (isDtoClass(type)) return buildSchemaForClass(type, schemas);
  return primitiveSchema(type);
}

/** Usado para @ApiResponse/@ApiBody com type + isArray. */
export function resolveTypeSchema(type: any, isArray: boolean | undefined, schemas: SchemaRegistry): any {
  const single = isDtoClass(type) ? buildSchemaForClass(type, schemas) : primitiveSchema(type);
  return isArray ? { type: 'array', items: single } : single;
}
