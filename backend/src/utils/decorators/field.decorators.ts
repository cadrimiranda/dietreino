import {
  Field as GqlField,
  FieldOptions,
  ReturnTypeFunc,
} from '@nestjs/graphql';

export function Field(
  typeFunc?: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    GqlField(typeFunc, {
      nullable: false,
      ...options,
    })(target, propertyKey);
  };
}

export function FieldNullable(
  typeFunc?: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    GqlField(typeFunc, {
      nullable: true,
      ...options,
    })(target, propertyKey);
  };
}

export function FieldArray(
  typeFunc: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    GqlField(() => [typeFunc()], {
      nullable: false,
      ...options,
    })(target, propertyKey);
  };
}

export function FieldArrayNullable(
  typeFunc: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    GqlField(() => [typeFunc()], {
      nullable: true,
      ...options,
    })(target, propertyKey);
  };
}
