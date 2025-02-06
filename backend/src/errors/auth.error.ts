export class AuthError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number = 401, code: string = 'AUTH_ERROR', details?: any) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
    this.details = details;

    // 确保原型链正确
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  // 序列化错误信息
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details
    };
  }

  // 预定义的错误类型
  static INVALID_CREDENTIALS = (details?: any) => 
    new AuthError('Invalid credentials', 401, 'INVALID_CREDENTIALS', details);

  static USER_NOT_FOUND = (details?: any) =>
    new AuthError('User not found', 404, 'USER_NOT_FOUND', details);

  static TOKEN_EXPIRED = (details?: any) =>
    new AuthError('Token has expired', 401, 'TOKEN_EXPIRED', details);

  static TOKEN_INVALID = (details?: any) =>
    new AuthError('Invalid token', 401, 'TOKEN_INVALID', details);

  static PERMISSION_DENIED = (details?: any) =>
    new AuthError('Permission denied', 403, 'PERMISSION_DENIED', details);

  static SESSION_EXPIRED = (details?: any) =>
    new AuthError('Session has expired', 401, 'SESSION_EXPIRED', details);

  static SESSION_NOT_FOUND = (details?: any) =>
    new AuthError('Session not found', 404, 'SESSION_NOT_FOUND', details);

  static TOO_MANY_REQUESTS = (details?: any) =>
    new AuthError('Too many requests', 429, 'TOO_MANY_REQUESTS', details);

  static ACCOUNT_LOCKED = (details?: any) =>
    new AuthError('Account is locked', 403, 'ACCOUNT_LOCKED', details);
}