import { BaseError } from '@errors/base.error';

export class KnowledgeNotFoundError extends BaseError {
  constructor(id: string) {
    super({
      code: 'KNOWLEDGE_NOT_FOUND',
      message: `知识 ${id} 不存在`,
      status: 404
    });
  }
}

export class KnowledgeCreateError extends BaseError {
  constructor(message: string) {
    super({
      code: 'KNOWLEDGE_CREATE_ERROR',
      message: `创建知识失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgeUpdateError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'KNOWLEDGE_UPDATE_ERROR',
      message: `更新知识 ${id} 失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgeDeleteError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'KNOWLEDGE_DELETE_ERROR',
      message: `删除知识 ${id} 失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgeSearchError extends BaseError {
  constructor(message: string) {
    super({
      code: 'KNOWLEDGE_SEARCH_ERROR',
      message: `搜索知识失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgeBulkImportError extends BaseError {
  constructor(message: string) {
    super({
      code: 'KNOWLEDGE_BULK_IMPORT_ERROR',
      message: `批量导入知识失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgeValidationError extends BaseError {
  constructor(message: string) {
    super({
      code: 'KNOWLEDGE_VALIDATION_ERROR',
      message: `知识验证失败: ${message}`,
      status: 400
    });
  }
}

export class KnowledgePermissionError extends BaseError {
  constructor(message: string) {
    super({
      code: 'KNOWLEDGE_PERMISSION_ERROR',
      message: `知识权限错误: ${message}`,
      status: 403
    });
  }
} 