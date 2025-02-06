import { BaseError } from './base.error';

export class DocumentError extends BaseError {
  constructor(code: string, message: string, details?: any) {
    super(code, message, details);
    this.name = 'DocumentError';
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(documentId: string) {
    super('DOCUMENT_NOT_FOUND', `文档不存在: ${documentId}`);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentValidationError extends DocumentError {
  constructor(details: any) {
    super('DOCUMENT_VALIDATION_ERROR', '文档验证失败', details);
    this.name = 'DocumentValidationError';
  }
}

export class DocumentAccessDeniedError extends DocumentError {
  constructor(documentId: string) {
    super('DOCUMENT_ACCESS_DENIED', `无权访问文档: ${documentId}`);
    this.name = 'DocumentAccessDeniedError';
  }
}

export class DocumentVersionConflictError extends DocumentError {
  constructor(documentId: string, currentVersion: number, providedVersion: number) {
    super(
      'DOCUMENT_VERSION_CONFLICT',
      `文档版本冲突: 当前版本 ${currentVersion}, 提供版本 ${providedVersion}`,
      { currentVersion, providedVersion }
    );
    this.name = 'DocumentVersionConflictError';
  }
}

export class DocumentStatusError extends DocumentError {
  constructor(documentId: string, currentStatus: string, targetStatus: string) {
    super(
      'DOCUMENT_STATUS_ERROR',
      `文档状态转换无效: 从 ${currentStatus} 到 ${targetStatus}`,
      { currentStatus, targetStatus }
    );
    this.name = 'DocumentStatusError';
  }
}

export class DocumentLimitExceededError extends DocumentError {
  constructor(limit: number) {
    super(
      'DOCUMENT_LIMIT_EXCEEDED',
      `超出文档数量限制: ${limit}`,
      { limit }
    );
    this.name = 'DocumentLimitExceededError';
  }
} 