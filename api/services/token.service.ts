import { Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { AccessTokenPayload } from '@/types/auth';

@Injectable()
export class TokenService {
  private readonly cache = new Map<string, number>();

  private sweeper?: NodeJS.Timeout;
  private static readonly SWEEP_INTERVAL_MS = 5 * 60 * 1000;

  $onInit() {
    this.sweeper = setInterval(() => {
      void this.sweep();
    }, TokenService.SWEEP_INTERVAL_MS);

    this.sweeper.unref();
  }

  $onDestroy() {
    if (this.sweeper) clearInterval(this.sweeper);
  }

  async revoke(payload: Pick<AccessTokenPayload, 'jti' | 'exp'>) {
    if (!payload.jti) return;

    this.cache.set(payload.jti, payload.exp);

    await prisma.revokedToken.upsert({
      where: { jti: payload.jti },
      create: { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) },
      update: {},
    });
  }

  async isRevoked(jti?: string): Promise<boolean> {
    if (!jti) return false;

    const cached = this.cache.get(jti);

    if (cached !== undefined) {
      if (cached > this.now()) return true;

      this.cache.delete(jti);
      return false;
    }

    const revoked = await prisma.revokedToken.findUnique({ where: { jti } });

    if (!revoked) return false;

    const exp = Math.floor(revoked.expiresAt.getTime() / 1000);

    if (exp <= this.now()) return false;

    this.cache.set(jti, exp);
    return true;
  }

  private async sweep() {
    const now = this.now();

    for (const [jti, expiresAt] of this.cache) {
      if (expiresAt <= now) this.cache.delete(jti);
    }

    try {
      await prisma.revokedToken.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    } catch (error) {
      console.error('revoked token sweep failed', error);
    }
  }

  private now() {
    return Math.floor(Date.now() / 1000);
  }
}
