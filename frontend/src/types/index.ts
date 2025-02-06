// Auth 模块类型定义
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Script 模块类型定义
export interface Script {
  id: string;
  title: string;
  description: string;
  type: 'emotion' | 'detective' | 'mechanism' | 'happy' | 'horror';
  difficulty: number;
  playerCount: {
    min: number;
    max: number;
  };
  duration: number;
  tags: string[];
  background?: string;
  notes?: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Character 模块类型定义
export interface Character {
  id: string;
  scriptId: string;
  name: string;
  type: 'main' | 'support' | 'npc';
  description: string;
  personality: string[];
  background: string;
  goals: string[];
  relationships: Array<{
    targetId: string;
    type: string;
    description: string;
  }>;
  secrets: string[];
  clues: string[];
  timeline: string[];
  status: 'active' | 'deleted';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Timeline 模块类型定义
export interface TimelineEvent {
  id: string;
  scriptId: string;
  title: string;
  description: string;
  timestamp: string;
  duration?: number;
  type: 'plot' | 'character' | 'clue';
  importance: 'high' | 'medium' | 'low';
  location?: string;
  characters: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  relatedEvents: string[];
  tags: string[];
  isPublic: boolean;
  metadata: {
    clues?: string[];
    items?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Knowledge 模块类型定义
export interface Knowledge {
  id: string;
  title: string;
  content: string;
  type: 'character' | 'plot' | 'clue' | 'dialogue' | 'background' | 'other';
  category: string;
  summary?: string;
  tags: string[];
  metadata?: Record<string, any>;
  visibility: 'public' | 'private';
  status: 'active' | 'archived' | 'deleted';
  projectId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// AI 服务模块类型定义
export interface AIRequest {
  type: 'character_analysis' | 'plot_suggestion' | 'clue_optimization';
  content: Record<string, any>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topK?: number;
    aspects?: string[];
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
  };
}

export interface AISuggestion {
  type: string;
  content: Record<string, any>;
  score?: number;
  suggestions?: string[];
  metadata?: Record<string, any>;
  timestamp: string;
}

// 通用响应类型
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
} 