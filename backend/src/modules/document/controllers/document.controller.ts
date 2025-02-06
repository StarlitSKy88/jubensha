import { Request, Response } from 'express';
import { z } from 'zod';
import { DocumentService } from '../services/document.service';
import { DocumentType, DocumentStatus } from '../models/document.model';
import { logger } from '@utils/logger';
import { ValidationError } from '@utils/errors';

const documentService = new DocumentService();

// 创建文档请求验证
const createDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  type: z.nativeEnum(DocumentType),
  projectId: z.string(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  permissions: z.array(z.enum(['read', 'write'])).optional(),
  status: z.nativeEnum(DocumentStatus).optional()
});

// 更新文档请求验证
const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  permissions: z.array(z.enum(['read', 'write'])).optional(),
  comment: z.string().optional()
});

// 获取文档列表请求验证
const getDocumentsSchema = z.object({
  projectId: z.string(),
  type: z.nativeEnum(DocumentType).optional(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional()
});

export class DocumentController {
  /**
   * 创建文档
   */
  async createDocument(req: Request, res: Response) {
    try {
      const data = createDocumentSchema.parse(req.body);
      const document = await documentService.createDocument(data);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('请求参数验证失败', error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }
      throw error;
    }
  }

  /**
   * 更新文档
   */
  async updateDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateDocumentSchema.parse(req.body);
      const document = await documentService.updateDocument(
        id,
        data,
        req.user.id
      );
      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('请求参数验证失败', error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }
      throw error;
    }
  }

  /**
   * 获取文档
   */
  async getDocument(req: Request, res: Response) {
    const { id } = req.params;
    const document = await documentService.getDocument(id, req.user.id);
    res.json(document);
  }

  /**
   * 获取文档列表
   */
  async getDocuments(req: Request, res: Response) {
    try {
      const query = getDocumentsSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      });

      const result = await documentService.getDocuments({
        ...query,
        userId: req.user.id
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('请求参数验证失败', error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })));
      }
      throw error;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(req: Request, res: Response) {
    const { id } = req.params;
    await documentService.deleteDocument(id, req.user.id);
    res.status(204).end();
  }

  /**
   * 获取文档版本历史
   */
  async getDocumentVersions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;

      const result = await documentService.getDocumentVersions(
        id,
        req.user.id,
        {
          page: page ? parseInt(page as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined
        }
      );

      res.json(result);
    } catch (error) {
      logger.error('获取文档版本历史失败', error);
      throw error;
    }
  }

  /**
   * 恢复到指定版本
   */
  async restoreVersion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { version } = req.body;

      if (!version || typeof version !== 'number') {
        throw new ValidationError('版本号无效', [{
          field: 'version',
          message: '版本号必须是有效的数字'
        }]);
      }

      const document = await documentService.restoreVersion(
        id,
        version,
        req.user.id
      );

      res.json(document);
    } catch (error) {
      logger.error('恢复文档版本失败', error);
      throw error;
    }
  }
} 