import type { CallHandler, NestInterceptor } from "../core/interfaces";
import { ExecutionContext } from "../core/interfaces";

export class LoggingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.getRequest();
    const start = Date.now();
    try {
      const result = await next.handle();
      const ms = Date.now() - start;
      console.log(
        `[nest-rr7] ${request.method} ${new URL(request.url).pathname} -> ${ms}ms`,
      );
      return result;
    } catch (err) {
      const ms = Date.now() - start;
      console.error(
        `[nest-rr7-error] ${request.method} ${new URL(request.url).pathname} -> ${ms}ms`,
      );
      throw err;
    }
  }
}
