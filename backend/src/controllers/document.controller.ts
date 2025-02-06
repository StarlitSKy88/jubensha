import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '@services/document.service';
import { IDocumentCreate, IDocumentUpdate, IDocumentQuery } from '@interfaces/document.interface';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  // 创建文档
  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const documentData: IDocumentCreate = req.body;
      const document = await this.documentService.createDocument(documentData, userId);
      res.status(201).json({
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
      const query: IDocumentQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        type: req.query.type as any,
        status: req.query.status as any,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        search: req.query.search as string
      };

      const documents = await this.documentService.getDocuments(query);
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文档详情
  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this.documentService.checkDocumentAccess(id, userId);
      const document = await this.documentService.getDocument(id);

      res.json({
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
      const userId = req.user.id;
      const updateData: IDocumentUpdate = req.body;

      await this.documentService.checkDocumentAccess(id, userId);
      const document = await this.documentService.updateDocument(id, updateData, userId);

      res.json({
        success: true,
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  // 删除文档
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await this.documentService.checkDocumentAccess(id, userId);
      await this.documentService.deleteDocument(id);

      res.json({
        success: true,
        message: '文档已删除'
      });
    } catch (error) {
      next(error);
    }
  }

  // 获取文档版本历史
  async getDocumentVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      await this.documentService.checkDocumentAccess(id, userId);
      const versions = await this.documentService.getDocumentVersions(id, query);

      res.json({
        success: true,
        data: versions
      });
    } catch (error) {
      next(error);
    }
  }
} 