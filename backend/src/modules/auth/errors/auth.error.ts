export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
} 