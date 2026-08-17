import 'reflect-metadata';
import { INJECTABLE_METADATA, INJECT_TOKENS, MODULE_METADATA, type ModuleOptions } from '../constants';

export function Injectable(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
  };
}

export function Module(options: ModuleOptions = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MODULE_METADATA, options, target);
  };
}

/**
 * Injeção explícita por token (geralmente a própria classe do provider).
 * Substitui a necessidade de "emitDecoratorMetadata" do TS, que o esbuild/Vite
 * não suporta — aqui o token é passado manualmente, não inferido pelo tipo do parâmetro.
 *
 * Uso: constructor(@Inject(UsersService) private usersService: UsersService) {}
 */
export function Inject(token: any): ParameterDecorator {
  return (target, _propertyKey, index) => {
    const tokens: any[] = Reflect.getMetadata(INJECT_TOKENS, target) || [];
    tokens[index] = token;
    Reflect.defineMetadata(INJECT_TOKENS, tokens, target);
  };
}
