import { Req } from '@tsed/common';
import { Context } from '@tsed/platform-params';
import { Middleware, MiddlewareMethods, UseAuth } from '@tsed/platform-middlewares';
import { Forbidden, Unauthorized } from '@tsed/exceptions';
import { Inject } from '@tsed/di';
import { useDecorators } from '@tsed/core';
import { Returns, Security } from '@tsed/schema';
import { Request } from 'express';
import { USER_ROLE } from '@/generated/prisma';
import prisma from '@/modules/db';
import { Authenticate, verifyJWT } from '@/modules/auth';
import { TokenService } from '@/services/token.service';
import { AccessTokenPayload, AUTH_ROLE, AuthRole, RoleRequirements } from '@/types/auth';
import { withAge } from '@/utils/age';

@Middleware()
export class AuthMiddleware implements MiddlewareMethods {
  @Inject()
  private tokenService!: TokenService;

  public async use(@Req() request: Req, @Context() ctx: Context) {
    const options: RoleRequirements = ctx.endpoint.get(AuthMiddleware) || { role: null };

    const req = request as unknown as Request;

    await this.resolveSession(req);

    const role = req.auth!.role;

    if (role !== AUTH_ROLE.CHILD && req.user!.isAdmin) {
      return true;
    }

    if (options.role && role !== options.role) {
      throw new Forbidden('You are not authorized to access this resource.');
    }

    return true;
  }

  private async resolveSession(request: Request) {
    const clientToken = request.token;

    if (!clientToken) {
      throw new Unauthorized('Unauthorized');
    }

    const payload = verifyJWT(clientToken);

    if (await this.tokenService.isRevoked(payload.jti)) {
      throw new Unauthorized('Session has been terminated. Please sign in again.');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Unauthorized('Unauthorized');
    }

    if (!user.active) {
      throw new Forbidden('Your account has been deactivated. Please contact an administrator.');
    }

    request.user = { ...user, isAdmin: user.role === USER_ROLE.ADMIN };
    request.auth = payload;

    if (payload.role === AUTH_ROLE.CHILD) {
      request.child = await this.resolveChild(payload, user.id);
    }
  }

  private async resolveChild(payload: AccessTokenPayload, parentId: string) {
    if (!payload.childId) {
      throw new Unauthorized('Invalid child session');
    }

    const child = await prisma.child.findUnique({
      where: { id: payload.childId },
      select: {
        id: true,
        parentId: true,
        fullName: true,
        birthDate: true,
        avatar: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!child || child.parentId !== parentId) {
      throw new Unauthorized('Child profile is no longer available');
    }

    if (!child.active) {
      throw new Forbidden('This child profile has been deactivated.');
    }

    return withAge(child);
  }
}

export { Authenticate };
export type { RoleRequirements, AuthRole };

export function AdminOnly(): RoleRequirements {
  return Authenticate(AUTH_ROLE.ADMIN);
}

export function ParentOnly(): RoleRequirements {
  return Authenticate(AUTH_ROLE.PARENT);
}

export function ChildOnly(): RoleRequirements {
  return Authenticate(AUTH_ROLE.CHILD);
}

export function Authorized(options: RoleRequirements = { role: null }): Function {
  return useDecorators(
    UseAuth(AuthMiddleware, options),
    Security('bearerAuth'),
    Returns(401).Description('missing, invalid or revoked access token'),
    Returns(403).Description('authenticated but not allowed to perform this action'),
  );
}
