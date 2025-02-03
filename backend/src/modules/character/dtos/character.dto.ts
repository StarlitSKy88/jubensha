import { Types } from 'mongoose';

// 创建角色 DTO
export interface CreateCharacterDto {
  name: string;
  description: string;
  age?: number;
  gender?: string;
  occupation?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  tags?: string[];
  imageUrl?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

// 更新角色 DTO
export interface UpdateCharacterDto {
  name?: string;
  description?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  tags?: string[];
  imageUrl?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

// 角色关系 DTO
export interface CharacterRelationshipDto {
  character: string; // Character ID
  type: string;
  description: string;
}

// 添加角色关系 DTO
export interface AddCharacterRelationshipDto {
  relationships: CharacterRelationshipDto[];
}

// 角色查询 DTO
export interface CharacterQueryDto {
  projectId: string;
  search?: string;
  tags?: string[];
  age?: {
    min?: number;
    max?: number;
  };
  gender?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 角色响应 DTO
export interface CharacterResponseDto {
  id: string;
  name: string;
  description: string;
  age?: number;
  ageGroup: string;
  gender?: string;
  occupation?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  relationships: Array<{
    character: {
      id: string;
      name: string;
    };
    type: string;
    description: string;
  }>;
  relationshipCount: number;
  tags: string[];
  imageUrl?: string;
  creator: {
    id: string;
    username: string;
  };
  projectId: string;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 批量操作 DTO
export interface BulkCharacterOperationDto {
  characterIds: string[];
  operation: 'delete' | 'makePublic' | 'makePrivate' | 'addTags' | 'removeTags';
  data?: {
    tags?: string[];
  };
} 