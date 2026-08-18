import { z, type ZodType } from 'zod';
import { BadRequestException } from './exceptions';
import type { ArgumentMetadata, PipeTransform } from './interfaces';

export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(`Parâmetro "${metadata.data ?? metadata.type}" precisa ser numérico`);
    }
    return parsed;
  }
}

export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new BadRequestException(`Parâmetro "${metadata.data ?? metadata.type}" precisa ser "true" ou "false"`);
  }
}

/**
 * Versão simplificada do ValidationPipe do Nest: recebe um objeto de regras
 * simples { campo: 'required' | ((v) => boolean) } em vez de depender do
 * class-validator (que exige decorators e reflection próprios).
 *
 * new ValidationPipe({ name: 'required' })
 */
export class ValidationPipe implements PipeTransform {
  constructor(private readonly rules: Record<string, 'required' | ((value: any) => boolean)>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    for (const [field, rule] of Object.entries(this.rules)) {
      const fieldValue = value?.[field];
      const valid = rule === 'required' ? fieldValue !== undefined && fieldValue !== null && fieldValue !== '' : rule(fieldValue);
      if (!valid) {
        throw new BadRequestException(`Campo "${field}" inválido`);
      }
    }

    return value;
  }
}

/**
 * Equivalente ao ValidationPipe global do Nest, mas usando o schema Zod
 * passado direto em @Body(schema)/@Query(schema) em vez de decorators do
 * class-validator num DTO — o mesmo schema serve tanto pra validar quanto
 * (via SwaggerModule, com z.toJSONSchema()) pra documentar.
 *
 * O pipe só precisa ser registrado uma vez, globalmente: não recebe schema
 * no construtor, ele é lido de `metadata.metatype` (preenchido pelo router a
 * partir do que foi passado em @Body/@Query). Parâmetros sem schema Zod
 * (ex: uma classe de DTO comum, ou nenhum tipo) passam direto, sem validação.
 *
 * Registro (uma vez, em bootstrap.ts): Application.create(AppModule, { pipes: [new ZodValidationPipe()] })
 */
export class ZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const schema = metadata.metatype;
    if (!(schema instanceof z.ZodType)) return value;

    const result = (schema as ZodType).safeParse(value);
    if (!result.success) {
      // Um issue por campo (o primeiro, se houver mais de uma regra quebrada) —
      // vira { errors: { campo: mensagem } } no corpo da resposta.
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || metadata.data || metadata.type;
        if (!(field in errors)) errors[field] = issue.message;
      }
      throw new BadRequestException('Validation Error', { errors });
    }

    return result.data;
  }
}
