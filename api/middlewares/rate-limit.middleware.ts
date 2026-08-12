import { createHash } from 'node:crypto';
import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';
import { AUDIO_RATE_LIMIT, AUTH_RATE_LIMIT, GLOBAL_RATE_LIMIT, RATE_LIMIT_WINDOW_MS } from '@/utils/constants';

const handler: Options['handler'] = (_req, res, _next, options) => {
  res.status(options.statusCode).json({
    success: false,
    _message: 'Too many requests. Please try again later.',
  });
};

const base = {
  windowMs: RATE_LIMIT_WINDOW_MS,
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  handler,
};

export const globalRateLimit = () =>
  rateLimit({
    ...base,
    limit: GLOBAL_RATE_LIMIT,
  });

export const authRateLimit = () =>
  rateLimit({
    ...base,
    limit: AUTH_RATE_LIMIT,
    skipSuccessfulRequests: true,
  });

export const audioRateLimit = () =>
  rateLimit({
    ...base,
    limit: AUDIO_RATE_LIMIT,
    keyGenerator: (req) => {
      const token = (req as Request).token;

      return token ? `t:${createHash('sha1').update(token).digest('hex')}` : `ip:${req.ip}`;
    },
  });
