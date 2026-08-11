import { NextFunction, Request, Response } from 'express';
import { nanoid } from '@/modules/nanoid';

export const REQUEST_ID_HEADER = 'x-request-id';

export const requestId = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const id = (Array.isArray(incoming) ? incoming[0] : incoming)?.trim() || nanoid();

    req.requestId = id;
    res.setHeader(REQUEST_ID_HEADER, id);

    next();
  };
};
