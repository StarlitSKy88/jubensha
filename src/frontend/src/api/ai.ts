import request from './request';

export interface GenerateParams {
  type: 'structure' | 'content' | 'dialogue';
  prompt: string;
  context?: {
    characters?: Array<{
      name: string;
      description: string;
    }>;
    background?: string;
    outline?: string;
  };
  temperature?: number;
}

export interface ValidationParams {
  type: 'logic' | 'quality' | 'playability';
  content: string;
  context?: {
    characters?: Array<{
      name: string;
      description: string;
    }>;
    background?: string;
    rules?: string[];
  };
}

export interface GenerateResponse {
  content: string;
  metadata?: {
    tokens: number;
    processingTime: number;
  };
}

export interface ValidationResponse {
  score: number;
  issues: Array<{
    type: string;
    description: string;
    suggestion: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
  metadata?: {
    processingTime: number;
  };
}

// 生成接口
export const generate = (data: GenerateParams) => {
  return request.post<GenerateResponse>('/api/ai/generate', data);
};

// 验证接口
export const validate = (data: ValidationParams) => {
  return request.post<ValidationResponse>('/api/ai/validate', data);
};

// 获取API使用统计
export const getUsageStats = () => {
  return request.get<{
    totalTokens: number;
    totalRequests: number;
    remainingQuota: number;
  }>('/api/ai/usage');
};

// 获取模型参数建议
export const getModelParams = (type: GenerateParams['type']) => {
  return request.get<{
    recommendedParams: {
      temperature: number;
      maxTokens: number;
      topP: number;
    };
    examples: string[];
  }>(`/api/ai/params/${type}`);
}; 