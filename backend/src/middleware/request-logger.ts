import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.url} [STARTED]`);

  // Log request body if exists
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body:', req.body);
  }

  // Log query parameters if exists
  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug('Query params:', req.query);
  }

  // Create response interceptor
  const originalSend = res.send;
  res.send = function (body): Response {
    const duration = Date.now() - start;
    const size = body ? Buffer.byteLength(body) : 0;

    logger.info(
      `${req.method} ${req.url} [FINISHED] ${res.statusCode} ${duration}ms - ${size}b`
    );

    if (process.env.NODE_ENV === 'development' && body) {
      logger.debug('Response body:', typeof body === 'string' ? body : JSON.parse(body));
    }

    return originalSend.call(this, body);
  };

  next();
}; 