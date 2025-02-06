import { BaseError } from './base.error';

export class DocumentError extends BaseError {
  constructor(message: string, status: number = 400) {
    super(message, status);
    this.name = 'DocumentError';
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(documentId: string) {
    super(`Document not found: ${documentId}`, 404);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentValidationError extends DocumentError {
  constructor(message: string) {
    super(`Document validation error: ${message}`, 400);
    this.name = 'DocumentValidationError';
  }
}

export class DocumentPermissionError extends DocumentError {
  constructor(userId: string, documentId: string) {
    super(`User ${userId} does not have permission to access document ${documentId}`, 403);
    this.name = 'DocumentPermissionError';
  }
}

export class DocumentVersionError extends DocumentError {
  constructor(message: string) {
    super(`Document version error: ${message}`, 400);
    this.name = 'DocumentVersionError';
  }
}

export class DocumentAccessDeniedError extends DocumentError {
  constructor(documentId: string) {
    super('DOCUMENT_ACCESS_DENIED', 403);
    this.name = 'DocumentAccessDeniedError';
  }
}

export class DocumentVersionConflictError extends DocumentError {
  constructor(documentId: string, currentVersion: number, providedVersion: number) {
    super(
      `Document version conflict: current version ${currentVersion}, provided version ${providedVersion}`,
      409
    );
    this.name = 'DocumentVersionConflictError';
  }
}

export class DocumentStatusError extends DocumentError {
  constructor(documentId: string, currentStatus: string, targetStatus: string) {
    super(
      `Document status transition invalid: from ${currentStatus} to ${targetStatus}`,
      400
    );
    this.name = 'DocumentStatusError';
  }
}

export class DocumentLimitExceededError extends DocumentError {
  constructor(limit: number) {
    super(
      `Document limit exceeded: ${limit}`,
      400
    );
    this.name = 'DocumentLimitExceededError';
  }
} 