export class RagError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'RagError';
    Object.setPrototypeOf(this, RagError.prototype);
  }
}

export class RagNotFoundError extends RagError {
  constructor(message: string = '知识不存在') {
    super(message, 404);
    this.name = 'RagNotFoundError';
    Object.setPrototypeOf(this, RagNotFoundError.prototype);
  }
}

export class RagValidationError extends RagError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'RagValidationError';
    Object.setPrototypeOf(this, RagValidationError.prototype);
  }
}

export class RagPermissionError extends RagError {
  constructor(message: string = '没有权限执行此操作') {
    super(message, 403);
    this.name = 'RagPermissionError';
    Object.setPrototypeOf(this, RagPermissionError.prototype);
  }
} 