import { KnowledgeType } from '../models/knowledge.model';

export interface CreateKnowledgeDto {
  title: string;
  content: string;
  type: KnowledgeType;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic?: boolean;
}

export interface UpdateKnowledgeDto {
  title?: string;
  content?: string;
  type?: KnowledgeType;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic?: boolean;
}

export interface KnowledgeQueryDto {
  projectId: string;
  type?: KnowledgeType;
  tags?: string[];
  search?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface KnowledgeResponseDto {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  metadata?: Record<string, any>;
  creator: {
    id: string;
    username: string;
  };
  projectId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchKnowledgeDto {
  query: string;
  type?: KnowledgeType;
  tags?: string[];
  limit?: number;
  threshold?: number;
}

export interface BulkImportKnowledgeDto {
  knowledge: Array<{
    title: string;
    content: string;
    type: KnowledgeType;
    tags?: string[];
    metadata?: Record<string, any>;
    isPublic?: boolean;
  }>;
} 