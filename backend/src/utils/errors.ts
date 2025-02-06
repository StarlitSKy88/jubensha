/**
 * 业务错误基类
 */
export class BaseError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly errors: Array<{
    field: string;
    message: string;
  }>;

  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation Error');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends BaseError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends BaseError {
  constructor(message: string) {
    super(message, 'AUTHORIZATION_ERROR', 403);
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
  constructor(message: string = '服务暂时不可用') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string, serviceName: string) {
    super(
      message,
      'EXTERNAL_SERVICE_ERROR',
      500,
      { service: serviceName }
    );
  }
}

// 错误处理中间件
export const errorHandler = (err: Error, req: any, res: any, next: any) => {
  if (err instanceof BaseError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.data && { details: err.data })
      }
    });
  }

  // 处理未知错误
  console.error('未捕获的错误:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    }
  });
}; 