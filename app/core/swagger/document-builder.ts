/** Security scheme do OpenAPI 3 (subset dos tipos usados aqui). */
export type SecuritySchemeObject =
  | {
      type: 'apiKey';
      name: string;
      in: 'header' | 'query' | 'cookie';
      description?: string;
    }
  | {
      type: 'http';
      scheme: string;
      bearerFormat?: string;
      description?: string;
    };

/** Options do addApiKey — mesma forma do @nestjs/swagger (o `type` é implícito). */
export interface ApiKeySchemeOptions {
  name: string;
  in?: 'header' | 'query' | 'cookie';
  description?: string;
}

/** Options do addBearerAuth — mesma forma do @nestjs/swagger. */
export interface BearerSchemeOptions {
  scheme?: string;
  bearerFormat?: string;
  description?: string;
}

export interface OpenApiConfig {
  title: string;
  description: string;
  version: string;
  tags: { name: string; description?: string }[];
  /** Schemes registrados via addApiKey/addBearerAuth, indexados pelo nome do scheme. */
  securitySchemes: Record<string, SecuritySchemeObject>;
}

/**
 * Mesma API fluente do DocumentBuilder do @nestjs/swagger, só que produz
 * um objeto de config simples (sem depender do runtime do Nest).
 *
 * const config = new DocumentBuilder()
 *   .setTitle('Users API')
 *   .setDescription('...')
 *   .setVersion('1.0')
 *   .addTag('users')
 *   .addApiKey({ name: 'x-api-key', in: 'header' }, 'api_key')
 *   .build();
 */
export class DocumentBuilder {
  private readonly config: OpenApiConfig = {
    title: '',
    description: '',
    version: '1.0.0',
    tags: [],
    securitySchemes: {},
  };

  setTitle(title: string): this {
    this.config.title = title;
    return this;
  }

  setDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  setVersion(version: string): this {
    this.config.version = version;
    return this;
  }

  addTag(name: string, description?: string): this {
    this.config.tags.push({ name, description });
    return this;
  }

  /**
   * Registra um security scheme `apiKey` (header/query/cookie). O `schemeName`
   * é o nome pelo qual as rotas referenciam o scheme via @ApiSecurity('api_key').
   */
  addApiKey(options: ApiKeySchemeOptions, schemeName = 'api_key'): this {
    return this.addSecurity(schemeName, {
      type: 'apiKey',
      name: options.name,
      in: options.in ?? 'header',
      ...(options.description ? { description: options.description } : {}),
    });
  }

  /**
   * Registra um security scheme `http`/bearer. Referenciado nas rotas via
   * @ApiBearerAuth() (que usa o schemeName padrão 'bearer').
   */
  addBearerAuth(options: BearerSchemeOptions = {}, schemeName = 'bearer'): this {
    return this.addSecurity(schemeName, {
      type: 'http',
      scheme: options.scheme ?? 'bearer',
      bearerFormat: options.bearerFormat ?? 'JWT',
      ...(options.description ? { description: options.description } : {}),
    });
  }

  /** Registra um security scheme arbitrário — escape hatch dos dois atalhos acima. */
  addSecurity(schemeName: string, scheme: SecuritySchemeObject): this {
    this.config.securitySchemes[schemeName] = scheme;
    return this;
  }

  build(): OpenApiConfig {
    return this.config;
  }
}
