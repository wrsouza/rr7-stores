import 'reflect-metadata';
import { API_RESPONSE_METADATA } from '../../constants';

export interface ApiResponseOptions {
  status: number;
  description?: string;
  /** Classe do DTO usado como schema da resposta (ou String/Number/Boolean). */
  type?: any;
  isArray?: boolean;
}

export function ApiResponse(options: ApiResponseOptions): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const existing: ApiResponseOptions[] =
      Reflect.getMetadata(API_RESPONSE_METADATA, target.constructor, propertyKey) || [];
    existing.push(options);
    Reflect.defineMetadata(API_RESPONSE_METADATA, existing, target.constructor, propertyKey);
    return descriptor;
  };
}

type ShorthandOptions = Omit<ApiResponseOptions, 'status'>;

// Mesmos atalhos que o @nestjs/swagger oferece, só chamando @ApiResponse por baixo.
export const ApiOkResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 200, ...options });
export const ApiCreatedResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 201, ...options });
export const ApiBadRequestResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 400, ...options });
export const ApiUnauthorizedResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 401, ...options });
export const ApiForbiddenResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 403, ...options });
export const ApiNotFoundResponse = (options: ShorthandOptions = {}) => ApiResponse({ status: 404, ...options });
export const ApiInternalServerErrorResponse = (options: ShorthandOptions = {}) =>
  ApiResponse({ status: 500, ...options });
