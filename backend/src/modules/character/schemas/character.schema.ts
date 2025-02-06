import { z } from 'zod';
import { CharacterType, CharacterStatus } from '../models/character.model';

// 基础角色schema
const baseCharacterSchema = {
  name: z.string().min(1, '名称不能为空').max(50, '名称不能超过50个字符'),
  type: z.nativeEnum(CharacterType, {
    errorMap: () => ({ message: '无效的角色类型' })
  }),
  status: z.nativeEnum(CharacterStatus, {
    errorMap: () => ({ message: '无效的角色状态' })
  }).optional(),
  description: z.string().min(1, '描述不能为空').max(500, '描述不能超过500个字符'),
  background: z.string().min(1, '背景不能为空').max(2000, '背景不能超过2000个字符'),
  clues: z.array(z.string()).optional(),
  relationships: z.array(
    z.object({
      character: z.string(),
      type: z.string().min(1, '关系类型不能为空'),
      description: z.string().min(1, '关系描述不能为空').max(200, '关系描述不能超过200个字符')
    })
  ).optional()
};

// 创建角色schema
export const createCharacterSchema = z.object({
  body: z.object({
    ...baseCharacterSchema,
    scriptId: z.string(),
    projectId: z.string()
  })
});

// 更新角色schema
export const updateCharacterSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    ...baseCharacterSchema
  }).partial()
});

// 删除角色schema
export const deleteCharacterSchema = z.object({
  params: z.object({
    id: z.string()
  })
});

// 获取单个角色schema
export const getCharacterSchema = z.object({
  params: z.object({
    id: z.string()
  })
});

// 获取角色列表schema
export const listCharacterSchema = z.object({
  query: z.object({
    scriptId: z.string().optional(),
    type: z.nativeEnum(CharacterType).optional(),
    status: z.nativeEnum(CharacterStatus).optional(),
    search: z.string().optional(),
    page: z.string().transform(str => parseInt(str)).optional(),
    limit: z.string().transform(str => parseInt(str)).optional()
  })
});

// 添加角色关系schema
export const addRelationshipSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    relationships: z.array(
      z.object({
        character: z.string(),
        type: z.string().min(1, '关系类型不能为空'),
        description: z.string().min(1, '关系描述不能为空').max(200, '关系描述不能超过200个字符')
      })
    )
  })
});

// 移除角色关系schema
export const removeRelationshipSchema = z.object({
  params: z.object({
    id: z.string(),
    relationshipId: z.string()
  })
}); 