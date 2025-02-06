import { BaseError } from '@utils/errors';

export class CharacterNotFoundError extends BaseError {
  constructor(id: string) {
    super('CHARACTER_NOT_FOUND', `角色 ${id} 不存在`, 404);
  }
}

export class CharacterCreateError extends BaseError {
  constructor(message: string) {
    super('CHARACTER_CREATE_ERROR', `创建角色失败: ${message}`, 400);
  }
}

export class CharacterUpdateError extends BaseError {
  constructor(id: string, message: string) {
    super('CHARACTER_UPDATE_ERROR', `更新角色 ${id} 失败: ${message}`, 400);
  }
}

export class CharacterDeleteError extends BaseError {
  constructor(id: string, message: string) {
    super('CHARACTER_DELETE_ERROR', `删除角色 ${id} 失败: ${message}`, 400);
  }
}

export class CharacterValidationError extends BaseError {
  constructor(message: string) {
    super('CHARACTER_VALIDATION_ERROR', `角色验证失败: ${message}`, 400);
  }
}

export class CharacterPermissionError extends BaseError {
  constructor(message: string) {
    super('CHARACTER_PERMISSION_ERROR', `角色权限错误: ${message}`, 403);
  }
}

export class CharacterRelationshipError extends BaseError {
  constructor(message: string) {
    super('CHARACTER_RELATIONSHIP_ERROR', `角色关系错误: ${message}`, 400);
  }
} 