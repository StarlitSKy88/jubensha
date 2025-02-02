/**
 * 业务错误基类
 */
export class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

/**
 * 验证错误
 */
export class ValidationError extends BusinessError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
    this.name = 'ValidationError'
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends BusinessError {
  constructor(message: string) {
    super('AUTHENTICATION_ERROR', message, 401)
    this.name = 'AuthenticationError'
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends BusinessError {
  constructor(message: string) {
    super('AUTHORIZATION_ERROR', message, 403)
    this.name = 'AuthorizationError'
  }
}

/**
 * 资源不存在错误
 */
export class NotFoundError extends BusinessError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends BusinessError {
  constructor(message: string) {
    super('CONFLICT', message, 409)
    this.name = 'ConflictError'
  }
}

/**
 * 服务器内部错误
 */
export class InternalServerError extends BusinessError {
  constructor(message: string = '服务器内部错误') {
    super('INTERNAL_SERVER_ERROR', message, 500)
    this.name = 'InternalServerError'
  }
} 