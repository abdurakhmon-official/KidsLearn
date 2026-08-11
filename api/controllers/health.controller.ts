import { Controller } from '@tsed/di';
import { Description, Get } from '@tsed/schema';
import { ServiceUnavailable } from '@tsed/exceptions';
import prisma from '@/modules/db';

@Controller('/health')
export class HealthController {
  @Get('/')
  check() {
    return this.live();
  }

  @Get('/live')
  live() {
    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
    };
  }

  @Get('/ready')
  async ready() {
    const startedAt = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailable('database is not reachable');
    }

    return {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      database: { status: 'ok', latencyMs: Date.now() - startedAt },
    };
  }
}
