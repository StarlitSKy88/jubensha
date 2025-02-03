import { body, param, query } from 'express-validator';
import { Types } from 'mongoose';

export const recommendationValidation = {
  // 获取知识推荐的验证规则
  getRecommendations: [
    param('knowledgeId')
      .notEmpty()
      .withMessage('知识ID不能为空')
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage('无效的知识ID格式'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制数量必须在1-100之间')
  ],

  // 刷新知识推荐的验证规则
  refreshRecommendations: [
    param('knowledgeId')
      .notEmpty()
      .withMessage('知识ID不能为空')
      .custom((value) => Types.ObjectId.isValid(value))
      .withMessage('无效的知识ID格式'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制数量必须在1-100之间')
  ],

  // 获取相似知识的验证规则
  getSimilarKnowledge: [
    body('content')
      .notEmpty()
      .withMessage('内容不能为空')
      .isString()
      .withMessage('内容必须是字符串')
      .isLength({ min: 1, max: 10000 })
      .withMessage('内容长度必须在1-10000字符之间'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制数量必须在1-100之间'),
    query('threshold')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('相似度阈值必须在0-1之间')
  ]
}; 