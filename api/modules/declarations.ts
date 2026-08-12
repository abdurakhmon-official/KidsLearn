import { PrismaClient } from '@/generated/prisma';
import { AccessTokenPayload, AuthenticatedChild, AuthenticatedUser } from '@/types/auth';

declare global {
  var __db: PrismaClient;

  namespace Express {
    export interface Request {
      requestId?: string;
      token?: string;
      user?: AuthenticatedUser;
      child?: AuthenticatedChild;
      auth?: AccessTokenPayload;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      PORT?: string;
      STAGE?: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN?: string;
      JWT_ISSUER?: string;
      JWT_AUDIENCE?: string;
      DATABASE_URL: string;
      CORS_ORIGIN?: string;
      SWAGGER_ENABLED?: string;
      SWAGGER_PATH?: string;
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_S3_BUCKET?: string;
      PUBLIC_API_URL?: string;
      TTS_PROVIDER?: string;
      AZURE_SPEECH_KEY?: string;
      AZURE_SPEECH_REGION?: string;
      TTS_VOICE_UZ?: string;
      TTS_VOICE_RU?: string;
      TTS_VOICE_EN?: string;
      TTS_RATE?: string;
      TTS_PITCH?: string;
      TTS_MAX_CHARS?: string;
      TTS_HOURLY_BUDGET?: string;
    }
  }
}
