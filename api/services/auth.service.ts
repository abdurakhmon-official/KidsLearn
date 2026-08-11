import prisma from '@/modules/db';
import { comparePassword, createAccessToken, createChildAccessToken, hashPassword } from '@/modules/auth';
import { BadRequest, Forbidden, NotFound, Unauthorized } from '@tsed/exceptions';
import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import { Request } from 'express';
import { LoginInput, LoginInputSchema, RegisterInput, RegisterInputSchema, UpdatePasswordInput, UpdatePasswordInputSchema, UpdateProfileInput, UpdateProfileInputSchema } from '@/inputs/auth.input';
import { TokenService } from '@/services/token.service';
import { AUTH_ROLE } from '@/types/auth';
import { withAge } from '@/utils/age';
import { USER_ROLE } from '@/generated/prisma';
import config from '@/config';

@Injectable()
export class AuthService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private tokenService!: TokenService;

  get req() {
    return this.context.getRequest<Request>();
  }

  get user() {
    return this.req.user;
  }

  get child() {
    return this.req.child;
  }

  async register(input: RegisterInput) {
    const data = RegisterInputSchema.parse(input);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new BadRequest('email already exist');
    }

    const allowAdmin = config.stage !== 'production';
    const hasUsers = allowAdmin ? await prisma.user.count() : 1;

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email,
        password: await hashPassword(data.password),
        phone: data.phone,
        avatar: data.avatar,
        role: hasUsers === 0 ? USER_ROLE.ADMIN : USER_ROLE.PARENT,
      },
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

    return {
      success: true,
      _message: 'registered successfully',
      data: createAccessToken(user),
    };
  }

  async login(input: LoginInput) {
    const data = LoginInputSchema.parse(input);
    const email = data.email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequest('invalid email or password');
    }

    const isValid = await comparePassword(data.password, user.password);

    if (!isValid) {
      throw new BadRequest('invalid email or password');
    }

    if (!user.active) {
      throw new Unauthorized('your account is inactive. please contact an administrator.');
    }

    return { success: true, data: createAccessToken(user) };
  }

  async logout() {
    const payload = this.req.auth;

    if (payload) {
      await this.tokenService.revoke(payload);
    }

    return { success: true, _message: 'signed out' };
  }

  async selectChild(childId: string) {
    if (this.req.auth?.role === AUTH_ROLE.CHILD) {
      throw new Forbidden('already in a child session');
    }

    const parent = this.user!;

    const child = await prisma.child.findUnique({
      where: { id: childId },
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

    if (!child || (child.parentId !== parent.id && !parent.isAdmin)) {
      throw new NotFound('child not found');
    }

    if (!child.active) {
      throw new Forbidden('this child profile has been deactivated');
    }

    const owner = await prisma.user.findUnique({
      where: { id: child.parentId },
      select: { id: true, email: true },
    });

    if (!owner) {
      throw new NotFound('child not found');
    }

    return {
      success: true,
      data: {
        ...createChildAccessToken(owner, child.id),
        child: withAge(child),
      },
    };
  }

  async me() {
    const user = await prisma.user.findUnique({
      where: { id: this.user?.id },
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
      throw new NotFound('user not found');
    }

    if (this.child) {
      return {
        success: true,
        data: {
          role: AUTH_ROLE.CHILD,
          child: this.child,
          parent: user,
        },
      };
    }

    const children = await prisma.child.findMany({
      where: { parentId: user.id },
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
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      data: {
        ...user,
        isAdmin: user.role === USER_ROLE.ADMIN,
        children: children.map(withAge),
      },
    };
  }

  async updateProfile(input: UpdateProfileInput) {
    const data = UpdateProfileInputSchema.parse(input);

    const updated = await prisma.user.update({
      where: { id: this.user?.id },
      data,
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

    return { success: true, _message: 'saved', data: updated };
  }

  async updatePassword(input: UpdatePasswordInput) {
    const data = UpdatePasswordInputSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id: this.user?.id } });

    if (!user) {
      throw new NotFound('user not found');
    }

    const isValid = await comparePassword(data.oldPassword, user.password);

    if (!isValid) {
      throw new BadRequest('current password is incorrect');
    }

    if (data.oldPassword === data.newPassword) {
      throw new BadRequest('new password must be different from the current password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(data.newPassword) },
    });

    if (this.req.auth) {
      await this.tokenService.revoke(this.req.auth);
    }

    return { success: true, _message: 'password updated. please sign in again.' };
  }
}
