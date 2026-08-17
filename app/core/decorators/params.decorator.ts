import 'reflect-metadata';
import { PARAMS_METADATA, type ParamMeta, ParamType } from '../constants';
import type { ClassOrInstance, PipeTransform } from '../interfaces';

function createParamDecorator(type: ParamType) {
  return (key?: string, ...pipes: ClassOrInstance<PipeTransform>[]): ParameterDecorator =>
    (target, propertyKey, index) => {
      if (!propertyKey) return;
      const existing: ParamMeta[] =
        Reflect.getMetadata(PARAMS_METADATA, target.constructor, propertyKey) || [];

      existing.push({ index, type, key, pipes });
      Reflect.defineMetadata(PARAMS_METADATA, existing, target.constructor, propertyKey);
    };
}

export const Param = createParamDecorator(ParamType.PARAM);
export const Body = createParamDecorator(ParamType.BODY);
export const Query = createParamDecorator(ParamType.QUERY);
export const Headers = createParamDecorator(ParamType.HEADERS);
export const Req = createParamDecorator(ParamType.REQ);
