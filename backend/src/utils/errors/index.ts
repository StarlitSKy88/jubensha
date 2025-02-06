import { StatusCodes } from 'http-status-codes';

export class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: number;
  public readonly isOperational: boolean;

  constructor(
    name: string,
    httpCode: number,
    description: string,
    isOperational: boolean
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class APIError extends BaseError {
  constructor(
    name: string,
    httpCode = StatusCodes.INTERNAL_SERVER_ERROR,
    description = 'Internal server error',
    isOperational = true
  ) {
    super(name, httpCode, description, isOperational);
  }
}

export class DocumentError extends APIError {
  constructor(description: string, httpCode = StatusCodes.BAD_REQUEST) {
    super('DocumentError', httpCode, description);
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(documentId: string) {
    super(`Document with id ${documentId} not found`, StatusCodes.NOT_FOUND);
  }
}

export class DocumentValidationError extends DocumentError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export class DocumentPermissionError extends DocumentError {
  constructor(message: string) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class DocumentVersionError extends DocumentError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}

export class AuthenticationError extends APIError {
  constructor(description: string) {
    super('AuthenticationError', StatusCodes.UNAUTHORIZED, description);
  }
}

export class AuthorizationError extends APIError {
  constructor(description: string) {
    super('AuthorizationError', StatusCodes.FORBIDDEN, description);
  }
}

export class ValidationError extends APIError {
  constructor(description: string) {
    super('ValidationError', StatusCodes.BAD_REQUEST, description);
  }
}

export class DatabaseError extends APIError {
  constructor(description: string) {
    super('DatabaseError', StatusCodes.INTERNAL_SERVER_ERROR, description, false);
  }
}

export class ConfigurationError extends APIError {
  constructor(description: string) {
    super('ConfigurationError', StatusCodes.INTERNAL_SERVER_ERROR, description, false);
  }
}

export class ExternalServiceError extends APIError {
  constructor(description: string) {
    super('ExternalServiceError', StatusCodes.BAD_GATEWAY, description, false);
  }
}

export class RateLimitError extends APIError {
  constructor(description: string) {
    super('RateLimitError', StatusCodes.TOO_MANY_REQUESTS, description);
  }
} 