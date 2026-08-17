import 'reflect-metadata';
import { Application } from './core/application';
import { AppModule } from './modules/app.module';

// Evita recriar o container a cada hot-reload do Vite em dev mode.
const GLOBAL_KEY = '__nest_rr8_app__';

export const app: Application =
  (globalThis as any)[GLOBAL_KEY] ?? Application.create(AppModule, { globalPrefix: '/api' });

(globalThis as any)[GLOBAL_KEY] = app;
