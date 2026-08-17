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
