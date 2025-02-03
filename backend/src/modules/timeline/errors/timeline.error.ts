export class TimelineError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'TimelineError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static NotFound(message: string = '时间线不存在'): TimelineError {
    return new TimelineError(message, 404);
  }

  static Unauthorized(message: string = '无权访问此时间线'): TimelineError {
    return new TimelineError(message, 401);
  }

  static ValidationError(message: string): TimelineError {
    return new TimelineError(message, 400);
  }

  static DuplicateError(message: string = '时间线已存在'): TimelineError {
    return new TimelineError(message, 409);
  }

  static RelationshipError(message: string): TimelineError {
    return new TimelineError(message, 400);
  }

  static BulkOperationError(message: string): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidDateError(message: string = '无效的日期'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidFilterError(message: string = '无效的过滤条件'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidSortError(message: string = '无效的排序条件'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidLayoutError(message: string = '无效的布局设置'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidDisplayError(message: string = '无效的显示设置'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidCharacterError(message: string = '无效的角色'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidEventError(message: string = '无效的事件'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidTagError(message: string = '无效的标签'): TimelineError {
    return new TimelineError(message, 400);
  }

  static InvalidMetadataError(message: string = '无效的元数据'): TimelineError {
    return new TimelineError(message, 400);
  }

  static CacheError(message: string = '缓存操作失败'): TimelineError {
    return new TimelineError(message, 500);
  }

  static DatabaseError(message: string = '数据库操作失败'): TimelineError {
    return new TimelineError(message, 500);
  }

  static VisualizationError(message: string = '生成可视化数据失败'): TimelineError {
    return new TimelineError(message, 500);
  }
}

export class TimelineNotFoundError extends TimelineError {
  constructor(message: string = '时间线事件不存在') {
    super(message, 404);
    this.name = 'TimelineNotFoundError';
    Object.setPrototypeOf(this, TimelineNotFoundError.prototype);
  }
}

export class TimelineValidationError extends TimelineError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'TimelineValidationError';
    Object.setPrototypeOf(this, TimelineValidationError.prototype);
  }
}

export class TimelinePermissionError extends TimelineError {
  constructor(message: string = '没有权限执行此操作') {
    super(message, 403);
    this.name = 'TimelinePermissionError';
    Object.setPrototypeOf(this, TimelinePermissionError.prototype);
  }
} 