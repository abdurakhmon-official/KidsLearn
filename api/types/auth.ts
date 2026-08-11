import { Child, User, USER_ROLE } from '@/generated/prisma';
import { WithAge } from '@/types/child';

/**
 * Bola `users` jadvalida saqlanmaydi, shuning uchun CHILD Prisma enum'ida yo'q —
 * u faqat token darajasidagi rol. Ota-ona `POST /auth/children/:id/select`
 * orqali bola sessiyasini oladi.
 */
export const AUTH_ROLE = { ...USER_ROLE, CHILD: 'CHILD' } as const;

export type AuthRole = (typeof AUTH_ROLE)[keyof typeof AUTH_ROLE];

/** Endpointga qo'yilgan rol talabi — `@Authorized(...)` shuni uzatadi. */
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

/** Kirgan ADMIN yoki PARENT. Bola sessiyasida bu — bolaning ota-onasi. */
export type AuthenticatedUser = Omit<User, 'password'> & {
  isAdmin: boolean;
};

/** Faqat CHILD tokenida to'ldiriladi. Yosh har so'rovda qayta hisoblanadi. */
export type AuthenticatedChild = WithAge<Child>;
