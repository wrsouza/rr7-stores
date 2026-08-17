import 'reflect-metadata';
import { GUARDS_METADATA, INTERCEPTORS_METADATA, PIPES_METADATA } from '../constants';

function createUseDecorator(metadataKey: symbol) {
  return (...items: any[]): ClassDecorator & MethodDecorator => {
    return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
      if (propertyKey) {
        // uso em método: @Get() @UseGuards(AuthGuard) findOne() {...}
        const existing = Reflect.getMetadata(metadataKey, target.constructor, propertyKey) || [];
        Reflect.defineMetadata(metadataKey, [...existing, ...items], target.constructor, propertyKey);
        return descriptor;
      }
      // uso na classe: @UseGuards(AuthGuard) @Controller('users') export class UsersController {}
      const existing = Reflect.getMetadata(metadataKey, target) || [];
      Reflect.defineMetadata(metadataKey, [...existing, ...items], target);
    }) as ClassDecorator & MethodDecorator;
  };
}

/** Aplica um ou mais CanActivate ao controller inteiro ou a um método. */
export const UseGuards = createUseDecorator(GUARDS_METADATA);

/** Aplica um ou mais NestInterceptor ao controller inteiro ou a um método. */
export const UseInterceptors = createUseDecorator(INTERCEPTORS_METADATA);

/**
 * Aplica um ou mais PipeTransform a todos os parâmetros do controller/método.
 * Para um pipe em um parâmetro específico, prefira passar direto no decorator
 * do parâmetro: @Param('id', ParseIntPipe).
 */
export const UsePipes = createUseDecorator(PIPES_METADATA);
