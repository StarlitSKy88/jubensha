export class KnowledgeError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'KnowledgeError';
    this.status = status;
  }

  static NotFound(message: string = '知识不存在'): KnowledgeError {
    return new KnowledgeError(message, 404);
  }

  static BadRequest(message: string = '请求参数错误'): KnowledgeError {
    return new KnowledgeError(message, 400);
  }

  static Unauthorized(message: string = '未授权访问'): KnowledgeError {
    return new KnowledgeError(message, 401);
  }

  static Forbidden(message: string = '禁止访问'): KnowledgeError {
    return new KnowledgeError(message, 403);
  }

  static Conflict(message: string = '资源冲突'): KnowledgeError {
    return new KnowledgeError(message, 409);
  }

  static ValidationError(message: string = '数据验证失败'): KnowledgeError {
    return new KnowledgeError(message, 422);
  }

  static InternalError(message: string = '服务器内部错误'): KnowledgeError {
    return new KnowledgeError(message, 500);
  }

  static ServiceUnavailable(message: string = '服务暂时不可用'): KnowledgeError {
    return new KnowledgeError(message, 503);
  }
} 