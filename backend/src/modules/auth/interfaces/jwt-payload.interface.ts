import { UserRole } from '../../../utils/roles.enum';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  iat?: number; // issued at
  exp?: number; // expiration
}
