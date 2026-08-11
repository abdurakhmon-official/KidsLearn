import { $log } from '@tsed/common';
import { PlatformExpress } from '@tsed/platform-express';
import { Server } from './server';
import prisma from '@/modules/db';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap() {
  try {
    const platform = await PlatformExpress.bootstrap(Server);
    await platform.listen();

    let shuttingDown = false;

    const shutdown = async (signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;

      $log.info({ event: 'SHUTDOWN_STARTED', signal });

      const guard = setTimeout(() => {
        $log.warn({ event: 'SHUTDOWN_TIMEOUT', signal });
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);

      guard.unref();

      try {
        await platform.stop();
        await prisma.$disconnect();
        $log.info({ event: 'SHUTDOWN_COMPLETE', signal });
        process.exit(0);
      } catch (error: any) {
        $log.error({ event: 'SHUTDOWN_ERROR', message: error.message, stack: error.stack });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (error: any) {
    $log.error({ event: 'SERVER_BOOTSTRAP_ERROR', message: error.message, stack: error.stack });
    process.exit(1);
  }
}

bootstrap();
