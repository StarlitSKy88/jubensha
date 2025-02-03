/**
 * 成功响应
 */
export const successResponse = (message: string, data?: any) => ({
  success: true,
  message,
  data
});

/**
 * 错误响应
 */
export const errorResponse = (message: string, errors?: any) => ({
  success: false,
  message,
  errors
});

/**
 * 分页响应
 */
export const paginationResponse = (
  message: string,
  data: any[],
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }
) => ({
  success: true,
  message,
  data,
  pagination
});

/**
 * 列表响应
 */
export const listResponse = (message: string, data: any[]) => ({
  success: true,
  message,
  data,
  total: data.length
});

/**
 * 详情响应
 */
export const detailResponse = (message: string, data: any) => ({
  success: true,
  message,
  data
});

/**
 * 创建响应
 */
export const createResponse = (message: string, data: any) => ({
  success: true,
  message,
  data
});

/**
 * 更新响应
 */
export const updateResponse = (message: string, data: any) => ({
  success: true,
  message,
  data
});

/**
 * 删除响应
 */
export const deleteResponse = (message: string) => ({
  success: true,
  message
});

/**
 * 批量操作响应
 */
export const bulkResponse = (
  message: string,
  results: {
    success: any[];
    failed: any[];
  }
) => ({
  success: true,
  message,
  results
});

/**
 * 统计响应
 */
export const statsResponse = (message: string, stats: any) => ({
  success: true,
  message,
  stats
});

/**
 * 导出响应
 */
export const exportResponse = (message: string, url: string) => ({
  success: true,
  message,
  url
});

/**
 * 导入响应
 */
export const importResponse = (
  message: string,
  results: {
    total: number;
    success: number;
    failed: number;
    errors?: any[];
  }
) => ({
  success: true,
  message,
  results
});

/**
 * 上传响应
 */
export const uploadResponse = (message: string, files: any[]) => ({
  success: true,
  message,
  files
});

/**
 * 下载响应
 */
export const downloadResponse = (message: string, url: string) => ({
  success: true,
  message,
  url
});

/**
 * 验证响应
 */
export const validateResponse = (message: string, isValid: boolean) => ({
  success: true,
  message,
  isValid
});

/**
 * 搜索响应
 */
export const searchResponse = (
  message: string,
  data: any[],
  total: number,
  pagination?: {
    currentPage: number;
    limit: number;
    totalPages: number;
  }
) => ({
  success: true,
  message,
  data,
  total,
  pagination
}); 