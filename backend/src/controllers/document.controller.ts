import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { DocumentValidationError } from '../errors/document.error';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // 创建文档
  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, content, type, tags } = req.body;
      const userId = req.user?.id;

      const document = await this.documentService.createDocument({
        title,
        content,
        type,
        tags,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // 更新文档
  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, type, tags, status } = req.body;
      const userId = req.user?.id;

      const document = await this.documentService.updateDocument(
        id,
        {
          title,
          content,
          type,
          tags,
          status
        },
        userId
      );

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文档
  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await this.documentService.getDocument(id);

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文档列表
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, tags, status, page, limit } = req.query;

      const result = await this.documentService.getDocuments({
        type: type as string,
        tags: tags ? (tags as string).split(',') : undefined,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({
        success: true,
        data: result.documents,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除文档
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.documentService.deleteDocument(id);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文档版本历史
  async getDocumentVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;

      const result = await this.documentService.getDocumentVersions(id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json({
        success: true,
        data: result.versions,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }
} 