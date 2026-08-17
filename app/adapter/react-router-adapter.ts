import { Application } from '../core/application';

export function createReactRouterHandlers(app: Application, basePath?: string) {
  const handler = async ({ request }: { request: Request }) => app.handle(request, basePath);

  return {
    loader: handler,
    action: handler,
  };
}
