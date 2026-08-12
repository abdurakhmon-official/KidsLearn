import merge from 'lodash.merge';
import { config as loadDotEnv } from 'dotenv';
import { TTS_FOLDER } from '@/utils/constants';

loadDotEnv();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.STAGE = process.env.STAGE || 'local';

let envConfig;

if (process.env.STAGE === 'production') {
  envConfig = require('./prod').default;
} else if (process.env.STAGE === 'testing') {
  envConfig = require('./testing').default;
} else {
  envConfig = require('./local').default;
}

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`missing required environment variable: ${name}. copy .env.sample to .env and fill it in.`);
  }

  return value;
};

export default merge(
  {
    stage: process.env.STAGE || 'local',
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    apiRoot: process.env.API_ROOT || '/api/v1',
    jwt: {
      secret: required('JWT_SECRET'),
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    secrets: {
      jwt: process.env.JWT_SECRET,
      dbURL: required('DATABASE_URL'),
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    swagger: {
      enabled:
        process.env.STAGE === 'production'
          ? process.env.SWAGGER_ENABLED === 'true'
          : process.env.SWAGGER_ENABLED !== 'false',
      path: process.env.SWAGGER_PATH || '/docs',
    },
    jwtClaims: {
      issuer: process.env.JWT_ISSUER || 'kidslearn-api',
      audience: process.env.JWT_AUDIENCE || 'kidslearn-app',
    },

    publicApiUrl: (process.env.PUBLIC_API_URL || `http://localhost:${Number(process.env.PORT) || 3000}${process.env.API_ROOT || '/api/v1'}`).replace(/\/+$/, ''),

    tts: {
      provider: (process.env.TTS_PROVIDER || (process.env.AZURE_SPEECH_KEY ? 'azure' : 'none')) as 'azure' | 'none',
      azure: {
        key: process.env.AZURE_SPEECH_KEY || '',
        region: process.env.AZURE_SPEECH_REGION || 'westeurope',
      },

      voices: {
        uz: process.env.TTS_VOICE_UZ || 'uz-UZ-MadinaNeural',
        ru: process.env.TTS_VOICE_RU || 'ru-RU-SvetlanaNeural',
        en: process.env.TTS_VOICE_EN || 'en-US-JennyNeural',
      } as Record<string, string>,

      rate: process.env.TTS_RATE || '-8%',
      pitch: process.env.TTS_PITCH || '+4%',

      maxChars: Number(process.env.TTS_MAX_CHARS) || 400,

      hourlyBudget: Number(process.env.TTS_HOURLY_BUDGET) || 500,
      folder: TTS_FOLDER,
    },
    AWS_REGION: process.env.AWS_REGION || 'eu-central-1',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_FILE_VIEW_EXPIRY_MINUTES: Number(process.env.AWS_FILE_VIEW_EXPIRY_MINUTES) || 900,
  },
  envConfig,
);
