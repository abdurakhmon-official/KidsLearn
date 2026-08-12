import { config as configDotEnv } from 'dotenv';
configDotEnv();

import { Configuration, Inject } from '@tsed/di';
import { PlatformApplication } from '@tsed/common';
import '@tsed/platform-express';
import '@tsed/ajv';
import '@tsed/swagger';
import '@tsed/platform-cache';

import '@tsed/platform-multer';
import * as controllers from './controllers';
import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import config from '@/config';
import bearerToken from 'express-bearer-token';
import { logging } from './middlewares/logging.middleware';
import { get404 } from './middlewares/404.middleware';
import { audioRateLimit, authRateLimit, globalRateLimit } from './middlewares/rate-limit.middleware';
import { requestId } from './middlewares/request-id.middleware';
import { CACHE_MAX_ENTRIES, CATEGORY_CACHE_TTL_MS } from '@/utils/constants';
import { TTS_PRUNE_INTERVAL_MS, TTS_PRUNE_STARTUP_DELAY_MS } from '@/types/audio';
import { AudioService } from '@/services/audio.service';
import './middlewares/error.middleware';

const API_ROOT = config.apiRoot;

const allowAnyOrigin = config.cors.origin === '*';

const corsOrigin = allowAnyOrigin ? true : config.cors.origin.split(',').map((origin: string) => origin.trim());

const corsCredentials = allowAnyOrigin ? false : config.cors.credentials;

@Configuration({
  acceptMimes: ['application/json'],
  httpPort: config.port,
  httpsPort: false,
  componentsScan: false,
  mount: {
    [API_ROOT]: [...Object.values(controllers)],
  },
  middlewares: [logging()],
  exclude: ['**/*.spec.ts'],
  cache: {
    ttl: CATEGORY_CACHE_TTL_MS,
    max: CACHE_MAX_ENTRIES,
  },
  swagger: config.swagger.enabled
    ? [
        {
          path: config.swagger.path,
          specVersion: '3.0.3',
          spec: {
            info: {
              title: 'KidsLearn API',
              version: '1.0.0',
              description:
                'REST API for KidsLearn: an interactive learning platform for children aged 1–7 — ' +
                'parents, child profiles, lessons, games, progress and awards.\n\n' +
                'Sign in through `POST /api/v1/auth/login`, then press **Authorize** and paste the returned token.\n\n' +
                'Children have no password: sign in as a parent, then call ' +
                '`POST /api/v1/auth/children/{id}/select` to get a child session token.',
            },
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                  bearerFormat: 'JWT',
                },
              },
            },
          },
        },
      ]
    : [],
  logger: {
    disableRoutesSummary: config.env !== 'development',
  },
})
export class Server {
  @Inject()
  protected app!: PlatformApplication<Application>;

  @Configuration()
  protected settings!: Configuration;

  @Inject()
  protected audioService!: AudioService;

  $beforeRoutesInit() {
    this.app.rawApp.set('trust proxy', 1);
    this.app.rawApp.set('query parser', 'extended');

    this.app.use(requestId());
    this.app.use(hpp());
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false,
      }),
    );
    this.app.use(
      cors({
        origin: corsOrigin,
        credentials: corsCredentials,
      }),
    );

    this.app.use(globalRateLimit());
    this.app.rawApp.use(`${API_ROOT}/auth/login`, authRateLimit());
    this.app.rawApp.use(`${API_ROOT}/auth/register`, authRateLimit());

    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(json({ limit: '1mb' }));
    this.app.use(urlencoded({ extended: true }));
    this.app.use(bearerToken());

    this.app.rawApp.use(`${API_ROOT}/audio/speak`, audioRateLimit());
  }

  $afterRoutesInit() {
    console.info(`======= ENV: ${config.env} =======`);
    console.info(`======= STAGE: ${config.stage} =======`);
    console.info(`App listening on port ${config.port}`);

    if (config.swagger.enabled) {
      console.info(`API documentation on http://localhost:${config.port}${config.swagger.path}`);
    }

    this.app.use(get404());
    this.scheduleTtsPrune();
  }

  private scheduleTtsPrune() {
    const run = () => {
      this.audioService
        .pruneTtsCache()
        .then(({ data }) => {
          if (data.removed) {
            console.info(`tts cache: removed ${data.removed} clips unused for ${data.days} days`);
          }
        })
        .catch((error: Error) => console.warn(`tts cache prune failed: ${error.message}`));
    };

    setTimeout(run, TTS_PRUNE_STARTUP_DELAY_MS).unref();
    setInterval(run, TTS_PRUNE_INTERVAL_MS).unref();
  }
}
