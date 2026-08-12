import { Child, User, USER_ROLE } from '@/generated/prisma';
import { WithAge } from '@/types/child';

export const AUTH_ROLE = { ...USER_ROLE, CHILD: 'CHILD' } as const;

export type AuthRole = (typeof AUTH_ROLE)[keyof typeof AUTH_ROLE];

export type RoleRequirements = {
  role: AuthRole | null;
};

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: AuthRole;
  childId?: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface AccessToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export type TokenSubject = {
  id: string;
  email: string;
  role: AuthRole;
  childId?: string;
};

export type AuthenticatedUser = Omit<User, 'password'> & {
  isAdmin: boolean;
};

export type AuthenticatedChild = WithAge<Child>;
