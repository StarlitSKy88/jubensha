export class CharacterError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'CharacterError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static NotFound(message: string = '角色不存在') {
    return new CharacterError(message, 404);
  }

  static Unauthorized(message: string = '没有权限执行此操作') {
    return new CharacterError(message, 403);
  }

  static ValidationError(message: string = '数据验证失败') {
    return new CharacterError(message, 400);
  }

  static DuplicateError(message: string = '角色已存在') {
    return new CharacterError(message, 409);
  }

  static RelationshipError(message: string = '角色关系操作失败') {
    return new CharacterError(message, 400);
  }

  static BulkOperationError(message: string = '批量操作失败') {
    return new CharacterError(message, 400);
  }
} 