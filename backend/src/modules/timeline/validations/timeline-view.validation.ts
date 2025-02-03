import { body, query, param } from 'express-validator';
import { Types } from 'mongoose';

export const timelineViewValidation = {
  createTimelineView: [
    param('projectId')
      .isMongoId()
      .withMessage('无效的项目ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('视图名称不能为空')
      .isLength({ max: 100 })
      .withMessage('视图名称不能超过100个字符'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('描述不能超过500个字符'),
    body('filters.startDate')
      .optional()
      .isISO8601()
      .withMessage('无效的开始日期格式'),
    body('filters.endDate')
      .optional()
      .isISO8601()
      .withMessage('无效的结束日期格式')
      .custom((endDate, { req }) => {
        if (req.body.filters?.startDate && endDate < req.body.filters.startDate) {
          throw new Error('结束日期不能早于开始日期');
        }
        return true;
      }),
    body('filters.characters')
      .optional()
      .isArray()
      .withMessage('角色列表必须是数组')
      .custom((characters) => {
        return characters.every((id: string) => Types.ObjectId.isValid(id));
      })
      .withMessage('无效的角色ID'),
    body('filters.tags')
      .optional()
      .isArray()
      .withMessage('标签列表必须是数组'),
    body('filters.eventTypes')
      .optional()
      .isArray()
      .withMessage('事件类型列表必须是数组'),
    body('display.groupBy')
      .optional()
      .isIn(['character', 'date', 'type'])
      .withMessage('无效的分组方式'),
    body('display.sortBy')
      .optional()
      .isIn(['date', 'importance'])
      .withMessage('无效的排序字段'),
    body('display.sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('无效的排序方向'),
    body('display.showDetails')
      .optional()
      .isBoolean()
      .withMessage('showDetails必须是布尔值'),
    body('display.colorScheme')
      .optional()
      .isString()
      .withMessage('无效的颜色方案'),
    body('layout.type')
      .optional()
      .isIn(['vertical', 'horizontal'])
      .withMessage('无效的布局类型'),
    body('layout.scale')
      .optional()
      .isIn(['linear', 'logarithmic'])
      .withMessage('无效的缩放类型'),
    body('layout.density')
      .optional()
      .isIn(['compact', 'comfortable'])
      .withMessage('无效的密度设置'),
    body('layout.showLabels')
      .optional()
      .isBoolean()
      .withMessage('showLabels必须是布尔值'),
    body('layout.showConnections')
      .optional()
      .isBoolean()
      .withMessage('showConnections必须是布尔值')
  ],

  updateTimelineView: [
    param('viewId')
      .isMongoId()
      .withMessage('无效的视图ID'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('视图名称不能为空')
      .isLength({ max: 100 })
      .withMessage('视图名称不能超过100个字符'),
    // ... 其他验证规则与 createTimelineView 相同
  ],

  getTimelineViews: [
    param('projectId')
      .isMongoId()
      .withMessage('无效的项目ID'),
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('搜索关键词不能超过100个字符'),
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
      .isIn(['name', 'createdAt', 'updatedAt'])
      .withMessage('无效的排序字段'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('无效的排序方向')
  ],

  getTimelineView: [
    param('viewId')
      .isMongoId()
      .withMessage('无效的视图ID')
  ],

  deleteTimelineView: [
    param('viewId')
      .isMongoId()
      .withMessage('无效的视图ID')
  ]
}; 