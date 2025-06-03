import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CLIENT = 'CLIENT',
  TRAINER = 'TRAINER',
  NUTRITIONIST = 'NUTRITIONIST',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
