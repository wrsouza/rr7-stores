import type { ZodType } from 'zod';

/**
 * Contexto de execução passado a guards e interceptors — versão simplificada
 * do ExecutionContext do Nest (aqui é sempre HTTP, então já vem "achatado").
 */
export class ExecutionContext {
  constructor(
    private readonly request: Request,
    private readonly controllerClass: any,
    private readonly handlerName: string | symbol,
    private readonly routeParams: Record<string, string>
  ) {}

  getRequest(): Request {
    return this.request;
  }

  getParams(): Record<string, string> {
    return this.routeParams;
  }

  getClass(): any {
    return this.controllerClass;
  }

  getHandler(): string | symbol {
    return this.handlerName;
  }
}

/** Mesmo contrato do CanActivate do @nestjs/common. */
export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

/** Mesmo contrato do CallHandler do @nestjs/common (aqui com Promise em vez de Observable). */
export interface CallHandler<T = any> {
  handle(): Promise<T>;
}

/** Mesmo contrato do NestInterceptor do @nestjs/common. */
export interface NestInterceptor<T = any, R = any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Promise<R>;
}

/** Mesmo contrato do ArgumentMetadata do @nestjs/common. */
export interface ArgumentMetadata {
  type: 'param' | 'body' | 'query' | 'headers';
  data?: string;
  /**
   * Classe de DTO ou schema Zod passado em @Body(Dto|schema)/@Query(Dto|schema),
   * quando houver — mesmo papel do metatype do Nest.
   */
  metatype?: { new (...args: any[]): any } | ZodType;
}

/** Mesmo contrato do PipeTransform do @nestjs/common. */
export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R | Promise<R>;
}

/** Um pipe/guard/interceptor pode ser passado como classe ou já instanciado. */
export type ClassOrInstance<T> = T | { new (...args: any[]): T };
