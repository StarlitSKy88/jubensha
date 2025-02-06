import { z } from 'zod';
import { ScriptStatus, ScriptDifficulty } from '../models/script.model';

// 基础剧本schema
const baseScriptSchema = {
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  description: z.string().min(1, '描述不能为空').max(500, '描述不能超过500个字符'),
  content: z.string().min(1, '内容不能为空').max(50000, '内容不能超过50000个字符'),
  difficulty: z.nativeEnum(ScriptDifficulty, {
    errorMap: () => ({ message: '无效的难度等级' })
  }),
  playerCount: z.object({
    min: z.number().int().min(1, '最小玩家数不能小于1'),
    max: z.number().int().min(1, '最大玩家数不能小于1')
  }).refine(data => data.min <= data.max, {
    message: '最小玩家数不能大于最大玩家数'
  }),
  duration: z.number().int().min(30, '游戏时长不能少于30分钟'),
  tags: z.array(z.string()).max(10, '标签不能超过10个').optional(),
  metadata: z.object({
    version: z.number().optional(),
    author: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    playCount: z.number().min(0).optional()
  }).optional()
};

// 创建剧本schema
export const createScriptSchema = z.object({
  body: z.object({
    ...baseScriptSchema
  })
});

// 更新剧本schema
export const updateScriptSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    ...baseScriptSchema,
    status: z.nativeEnum(ScriptStatus).optional()
  }).partial()
});

// 发布剧本schema
export const publishScriptSchema = z.object({
  params: z.object({
    id: z.string()
  })
});

// 评分schema
export const rateScriptSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    rating: z.number().min(0, '评分不能小于0').max(5, '评分不能大于5')
  })
});

// 查询剧本列表schema
export const listScriptSchema = z.object({
  query: z.object({
    status: z.nativeEnum(ScriptStatus).optional(),
    difficulty: z.nativeEnum(ScriptDifficulty).optional(),
    tags: z.string().transform(str => str.split(',')).optional(),
    page: z.string().transform(str => parseInt(str)).optional(),
    limit: z.string().transform(str => parseInt(str)).optional()
  })
}); 