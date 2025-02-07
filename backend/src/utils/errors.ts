/**
 * 业务错误基类
 */
export class BaseError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * 认证错误
 */
export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * 授权错误
 */
export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message, 'FORBIDDEN', 403);
  }
}

/**
 * 资源不存在错误
 */
export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

/**
 * 服务器内部错误
 */
export class InternalServerError extends BaseError {
  constructor(message: string = '服务器内部错误') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message: string) {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502);
  }
}

// 错误处理中间件
export const errorHandler = (err: Error, req: any, res: any, next: any) => {
  console.error(err);

  if (err instanceof BaseError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // 处理未知错误
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    }
  });
}; 