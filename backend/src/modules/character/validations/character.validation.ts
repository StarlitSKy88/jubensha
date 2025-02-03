import { body, param, query } from 'express-validator';
import { isValidObjectId } from '../../../middleware/validator';

export const characterValidation = {
  createCharacter: [
    param('projectId')
      .custom(isValidObjectId)
      .withMessage('项目ID格式不正确'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('角色名称长度应在2-50个字符之间'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('角色描述长度应在1-2000个字符之间'),
    body('age')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('年龄应在0-1000之间'),
    body('gender')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('性别描述不能超过20个字符'),
    body('occupation')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('职业描述不能超过100个字符'),
    body('background')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('背景故事不能超过5000个字符'),
    body('personality')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('性格描述不能超过1000个字符'),
    body('appearance')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('外貌描述不能超过1000个字符'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组格式'),
    body('tags.*')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('标签不能为空'),
    body('imageUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('图片URL格式不正确'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('metadata必须是对象格式')
  ],

  getCharacters: [
    param('projectId')
      .custom(isValidObjectId)
      .withMessage('项目ID格式不正确'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('搜索关键词不能超过100个字符'),
    query('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组格式'),
    query('age')
      .optional()
      .isJSON()
      .withMessage('年龄范围格式不正确'),
    query('gender')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('性别描述不能超过20个字符'),
    query('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是大于0的整数'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'name', 'age'])
      .withMessage('排序字段不正确'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('排序方向不正确')
  ],

  getCharacter: [
    param('characterId')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确')
  ],

  updateCharacter: [
    param('characterId')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('角色名称长度应在2-50个字符之间'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('角色描述长度应在1-2000个字符之间'),
    body('age')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('年龄应在0-1000之间'),
    body('gender')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('性别描述不能超过20个字符'),
    body('occupation')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('职业描述不能超过100个字符'),
    body('background')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('背景故事不能超过5000个字符'),
    body('personality')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('性格描述不能超过1000个字符'),
    body('appearance')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('外貌描述不能超过1000个字符'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('标签必须是数组格式'),
    body('tags.*')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('标签不能为空'),
    body('imageUrl')
      .optional()
      .trim()
      .isURL()
      .withMessage('图片URL格式不正确'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic必须是布尔值'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('metadata必须是对象格式')
  ],

  deleteCharacter: [
    param('characterId')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确')
  ],

  addRelationships: [
    param('characterId')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确'),
    body('relationships')
      .isArray()
      .withMessage('relationships必须是数组格式'),
    body('relationships.*.character')
      .custom(isValidObjectId)
      .withMessage('目标角色ID格式不正确'),
    body('relationships.*.type')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('关系类型长度应在1-50个字符之间'),
    body('relationships.*.description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('关系描述长度应在1-500个字符之间')
  ],

  removeRelationship: [
    param('characterId')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确'),
    param('targetCharacterId')
      .custom(isValidObjectId)
      .withMessage('目标角色ID格式不正确')
  ],

  bulkOperation: [
    param('projectId')
      .custom(isValidObjectId)
      .withMessage('项目ID格式不正确'),
    body('characterIds')
      .isArray({ min: 1 })
      .withMessage('characterIds必须是非空数组'),
    body('characterIds.*')
      .custom(isValidObjectId)
      .withMessage('角色ID格式不正确'),
    body('operation')
      .isIn(['delete', 'makePublic', 'makePrivate', 'addTags', 'removeTags'])
      .withMessage('不支持的操作类型'),
    body('data.tags')
      .optional()
      .isArray()
      .withMessage('tags必须是数组格式'),
    body('data.tags.*')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('标签不能为空')
  ]
}; 