import 'reflect-metadata';
import { CONTROLLER_METADATA } from '../constants';

/**
 * Marca uma classe como controller e define o prefixo de rota.
 * Ex: @Controller('users') -> todas as rotas do controller ficam sob /users
 */
export function Controller(prefix = ''): ClassDecorator {
  return (target) => {
    const normalized = prefix.startsWith('/') ? prefix : `/${prefix}`;
    Reflect.defineMetadata(CONTROLLER_METADATA, { prefix: normalized.replace(/\/$/, '') }, target);
  };
}
