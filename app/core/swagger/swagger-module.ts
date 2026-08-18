import 'reflect-metadata';
import { Application } from '../application';
import {
  API_BODY_METADATA,
  API_OPERATION_METADATA,
  API_PARAM_METADATA,
  API_PROPERTY_METADATA,
  API_QUERY_METADATA,
  API_RESPONSE_METADATA,
  API_SECURITY_METADATA,
  API_TAGS_METADATA,
  CONTROLLER_METADATA,
  type ParamMeta,
  PARAMS_METADATA,
  ParamType,
  type RouteDefinitionMeta,
  ROUTES_METADATA,
} from '../constants';
import type { ApiBodyOptions, ApiParamOptions, ApiQueryOptions } from '../decorators/swagger/api-params.decorator';
import type { ApiPropertyOptions } from '../decorators/swagger/api-property.decorator';
import type { ApiResponseOptions } from '../decorators/swagger/api-response.decorator';
import type { SecurityRequirement } from '../decorators/swagger/api-security.decorator';
import type { OpenApiConfig, SecuritySchemeObject } from './document-builder';
import { isZodSchema, propertyToSchema, resolveTypeSchema, type SchemaRegistry } from './schema-builder';
import { z } from 'zod';

export interface OpenApiDocument {
  openapi: '3.0.0';
  info: { title: string; description: string; version: string };
  tags: { name: string; description?: string }[];
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes?: Record<string, SecuritySchemeObject>;
  };
}

function toOpenApiPath(rawPath: string): string {
  // ":id" (estilo Express/RRv7) -> "{id}" (estilo OpenAPI)
  return rawPath.replace(/:([^/]+)/g, '{$1}');
}

export class SwaggerModule {
  /**
   * Equivalente ao SwaggerModule.createDocument(app, config) do Nest, mas
   * lendo a metadata gravada pelos decorators desta lib em vez dos
   * internos do @nestjs/core.
   */
  static createDocument(app: Application, config: OpenApiConfig): OpenApiDocument {
    const schemas: SchemaRegistry = new Map();
    const paths: Record<string, any> = {};
    const prefix = app.getGlobalPrefix();

    for (const controllerClass of app.getControllers()) {
      const controllerMeta = Reflect.getMetadata(CONTROLLER_METADATA, controllerClass);
      if (!controllerMeta) continue; // não é controller (é provider comum)

      const defaultTag = controllerClass.name.replace(/Controller$/, '');
      const tags: string[] = Reflect.getMetadata(API_TAGS_METADATA, controllerClass) || [defaultTag];
      const routeDefs: RouteDefinitionMeta[] = Reflect.getMetadata(ROUTES_METADATA, controllerClass) || [];

      for (const def of routeDefs) {
        const rawPath = `${prefix}${controllerMeta.prefix}${def.path}` || '/';
        const openApiPath = toOpenApiPath(rawPath);
        paths[openApiPath] ??= {};
        paths[openApiPath][def.method.toLowerCase()] = buildOperation(
          controllerClass,
          def,
          tags,
          schemas
        );
      }
    }

    const securitySchemes = config.securitySchemes ?? {};

    return {
      openapi: '3.0.0',
      info: {
        title: config.title,
        description: config.description,
        version: config.version,
      },
      tags: config.tags,
      paths,
      components: {
        schemas: Object.fromEntries(schemas),
        ...(Object.keys(securitySchemes).length ? { securitySchemes } : {}),
      },
    };
  }
}

function buildOperation(
  controllerClass: any,
  def: RouteDefinitionMeta,
  tags: string[],
  schemas: SchemaRegistry
) {
  const operation: any = { tags, responses: {} };

  const opMeta = Reflect.getMetadata(API_OPERATION_METADATA, controllerClass, def.handlerName);
  if (opMeta) Object.assign(operation, opMeta);

  const paramsMeta: ParamMeta[] =
    Reflect.getMetadata(PARAMS_METADATA, controllerClass, def.handlerName) || [];

  operation.parameters = buildParameters(controllerClass, def, paramsMeta, schemas);

  // @ApiBody explícito tem prioridade; na ausência, cai pro DTO passado direto
  // em @Body(Dto) — não precisa repetir o tipo dos dois lados.
  let bodyMeta: ApiBodyOptions | undefined = Reflect.getMetadata(API_BODY_METADATA, controllerClass, def.handlerName);
  if (!bodyMeta) {
    const bodyParam = paramsMeta.find((p) => p.type === ParamType.BODY && !p.key && p.dtoType);
    if (bodyParam) bodyMeta = { type: bodyParam.dtoType };
  }
  if (bodyMeta) {
    operation.requestBody = {
      content: {
        'application/json': { schema: resolveTypeSchema(bodyMeta.type, bodyMeta.isArray, schemas) },
      },
    };
  }

  const responses: ApiResponseOptions[] =
    Reflect.getMetadata(API_RESPONSE_METADATA, controllerClass, def.handlerName) || [];

  if (responses.length === 0) {
    operation.responses['200'] = { description: 'OK' };
  } else {
    for (const r of responses) {
      operation.responses[String(r.status)] = {
        description: r.description || '',
        ...(r.type
          ? { content: { 'application/json': { schema: resolveTypeSchema(r.type, r.isArray, schemas) } } }
          : {}),
      };
    }
  }

  const security = buildSecurity(controllerClass, def);
  if (security.length) operation.security = security;

  if (!operation.parameters.length) delete operation.parameters;

  return operation;
}

/**
 * Junta o que o @ApiSecurity gravou no controller (vale pra todas as rotas)
 * com o que foi gravado no handler. Requirements repetidos para o mesmo
 * scheme ficam só uma vez, com o do método vencendo.
 */
function buildSecurity(controllerClass: any, def: RouteDefinitionMeta): SecurityRequirement[] {
  const fromClass: SecurityRequirement[] =
    Reflect.getMetadata(API_SECURITY_METADATA, controllerClass) || [];
  const fromMethod: SecurityRequirement[] =
    Reflect.getMetadata(API_SECURITY_METADATA, controllerClass, def.handlerName) || [];

  const byScheme = new Map<string, SecurityRequirement>();
  for (const requirement of [...fromClass, ...fromMethod]) {
    for (const [schemeName, scopes] of Object.entries(requirement)) {
      byScheme.set(schemeName, { [schemeName]: scopes });
    }
  }

  return Array.from(byScheme.values());
}

function buildParameters(controllerClass: any, def: RouteDefinitionMeta, paramsMeta: ParamMeta[], schemas: SchemaRegistry) {
  // 1) detecta automaticamente a partir dos próprios @Param/@Query do handler
  const byName = new Map<string, any>();

  for (const p of paramsMeta) {
    if (p.type === ParamType.PARAM && p.key) {
      byName.set(`path:${p.key}`, { name: p.key, in: 'path', required: true, schema: { type: 'string' } });
    }
    if (p.type === ParamType.QUERY && p.key) {
      byName.set(`query:${p.key}`, { name: p.key, in: 'query', required: false, schema: { type: 'string' } });
    }
    if (p.type === ParamType.QUERY && !p.key && p.dtoType) {
      // @Query(Dto) sem key: expande cada @ApiProperty do DTO (ou cada campo
      // do schema Zod) numa entrada de query própria — mesmo resultado de
      // listar um @ApiQuery por campo.
      if (isZodSchema(p.dtoType)) {
        const jsonSchema = z.toJSONSchema(p.dtoType, { target: 'openapi-3.0' }) as any;
        const required: string[] = jsonSchema.required ?? [];
        for (const [name, propSchema] of Object.entries<any>(jsonSchema.properties ?? {})) {
          byName.set(`query:${name}`, {
            name,
            in: 'query',
            required: required.includes(name),
            schema: propSchema,
          });
        }
      } else {
        const props: Record<string, ApiPropertyOptions> = Reflect.getMetadata(API_PROPERTY_METADATA, p.dtoType) || {};
        for (const [name, opts] of Object.entries(props)) {
          byName.set(`query:${name}`, {
            name,
            in: 'query',
            required: opts.required !== false,
            schema: propertyToSchema(opts, schemas),
          });
        }
      }
    }
  }

  // 2) sobrepõe/enriquece com o que foi declarado explicitamente via @ApiParam/@ApiQuery
  const apiParams: ApiParamOptions[] =
    Reflect.getMetadata(API_PARAM_METADATA, controllerClass, def.handlerName) || [];
  for (const p of apiParams) {
    byName.set(`path:${p.name}`, {
      name: p.name,
      in: 'path',
      required: p.required ?? true,
      description: p.description,
      schema: { type: typeof p.type === 'string' ? p.type : 'string', enum: p.enum },
    });
  }

  const apiQueries: ApiQueryOptions[] =
    Reflect.getMetadata(API_QUERY_METADATA, controllerClass, def.handlerName) || [];
  for (const q of apiQueries) {
    byName.set(`query:${q.name}`, {
      name: q.name,
      in: 'query',
      required: q.required ?? false,
      description: q.description,
      schema: { type: typeof q.type === 'string' ? q.type : 'string', enum: q.enum },
    });
  }

  return Array.from(byName.values());
}
