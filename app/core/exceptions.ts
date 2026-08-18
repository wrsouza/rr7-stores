export class HttpException extends Error {
  /** Campos extras mesclados no corpo da resposta (ex: { errors: { campo: mensagem } }). */
  constructor(message: string, public status = 500, public readonly details?: Record<string, any>) {
    super(message);
  }
}

// Mesmos nomes/semânticas do @nestjs/common — só a classe base que muda.
export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', details?: Record<string, any>) {
    super(message, 400, details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}
