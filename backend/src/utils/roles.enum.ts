import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CLIENT = 'client',
  TRAINER = 'trainer',
  NUTRITIONIST = 'nutritionist',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
