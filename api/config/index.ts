import merge from 'lodash.merge';
import { config as loadDotEnv } from 'dotenv';

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
    AWS_REGION: process.env.AWS_REGION || 'eu-central-1',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_FILE_VIEW_EXPIRY_MINUTES: Number(process.env.AWS_FILE_VIEW_EXPIRY_MINUTES) || 900,
  },
  envConfig,
);
