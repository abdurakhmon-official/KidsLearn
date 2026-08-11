import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Unauthorized } from '@tsed/exceptions';
import config from '@/config';
import { AccessToken, AccessTokenPayload, AUTH_ROLE, AuthRole, RoleRequirements, TokenSubject } from '@/types/auth';
import { BCRYPT_SALT_ROUNDS } from '@/utils/constants';
import { nanoid } from '@/modules/nanoid';

export function Authenticate(role: AuthRole | null = null): RoleRequirements {
  return { role };
}

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const createJWT = ({ id, email, role, childId }: TokenSubject) => {
  return jwt.sign({ email, role, jti: nanoid(), ...(childId ? { childId } : {}) }, config.jwt.secret, {
    subject: id,
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwtClaims.issuer,
    audience: config.jwtClaims.audience,
  } as SignOptions);
};

export const createAccessToken = (subject: TokenSubject): AccessToken => {
  const accessToken = createJWT(subject);
  const { iat, exp } = jwt.decode(accessToken) as AccessTokenPayload;

  return { accessToken, tokenType: 'Bearer', expiresIn: exp - iat };
};

export const createChildAccessToken = (parent: { id: string; email: string }, childId: string): AccessToken => {
  return createAccessToken({ id: parent.id, email: parent.email, role: AUTH_ROLE.CHILD, childId: childId });
};

export const verifyJWT = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.jwtClaims.issuer,
      audience: config.jwtClaims.audience,
    }) as AccessTokenPayload;
  } catch {
    throw new Unauthorized('Invalid or expired token');
  }
};
