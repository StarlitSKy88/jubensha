import Joi from 'joi';

export const documentSchema = {
  // 创建文档验证
  create: Joi.object({
    title: Joi.string().required().max(200).messages({
      'string.empty': '标题不能为空',
      'string.max': '标题最多200个字符',
      'any.required': '标题是必填项'
    }),
    content: Joi.string().required().messages({
      'string.empty': '内容不能为空',
      'any.required': '内容是必填项'
    }),
    type: Joi.string().valid('script', 'rule', 'note').required().messages({
      'string.empty': '类型不能为空',
      'any.only': '类型必须是script、rule或note',
      'any.required': '类型是必填项'
    }),
    tags: Joi.array().items(Joi.string()).messages({
      'array.base': '标签必须是数组'
    })
  }),

  // 更新文档验证
  update: Joi.object({
    title: Joi.string().max(200).messages({
      'string.max': '标题最多200个字符'
    }),
    content: Joi.string(),
    type: Joi.string().valid('script', 'rule', 'note').messages({
      'any.only': '类型必须是script、rule或note'
    }),
    tags: Joi.array().items(Joi.string()).messages({
      'array.base': '标签必须是数组'
    }),
    status: Joi.string().valid('draft', 'published', 'archived').messages({
      'any.only': '状态必须是draft、published或archived'
    })
  }),

  // 查询参数验证
  query: Joi.object({
    type: Joi.string().valid('script', 'rule', 'note'),
    tags: Joi.string(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    page: Joi.number().integer().min(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码最小为1'
    }),
    limit: Joi.number().integer().min(1).max(100).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量最小为1',
      'number.max': '每页数量最大为100'
    })
  })
}; 