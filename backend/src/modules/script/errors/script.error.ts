import { BaseError } from '@utils/errors';

export class ScriptNotFoundError extends BaseError {
  constructor(id: string) {
    super({
      code: 'SCRIPT_NOT_FOUND',
      message: `剧本 ${id} 不存在`,
      status: 404
    });
  }
}

export class ScriptCreateError extends BaseError {
  constructor(message: string) {
    super({
      code: 'SCRIPT_CREATE_ERROR',
      message: `创建剧本失败: ${message}`,
      status: 400
    });
  }
}

export class ScriptUpdateError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'SCRIPT_UPDATE_ERROR',
      message: `更新剧本 ${id} 失败: ${message}`,
      status: 400
    });
  }
}

export class ScriptDeleteError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'SCRIPT_DELETE_ERROR',
      message: `删除剧本 ${id} 失败: ${message}`,
      status: 400
    });
  }
}

export class ScriptValidationError extends BaseError {
  constructor(message: string) {
    super({
      code: 'SCRIPT_VALIDATION_ERROR',
      message: `剧本验证失败: ${message}`,
      status: 400
    });
  }
}

export class ScriptPermissionError extends BaseError {
  constructor(message: string) {
    super({
      code: 'SCRIPT_PERMISSION_ERROR',
      message: `剧本权限错误: ${message}`,
      status: 403
    });
  }
}

export class ScriptPublishError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'SCRIPT_PUBLISH_ERROR',
      message: `发布剧本 ${id} 失败: ${message}`,
      status: 400
    });
  }
}

export class ScriptStatusError extends BaseError {
  constructor(id: string, message: string) {
    super({
      code: 'SCRIPT_STATUS_ERROR',
      message: `剧本 ${id} 状态错误: ${message}`,
      status: 400
    });
  }
} 