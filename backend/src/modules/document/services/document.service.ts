import { logger } from '@utils/logger';
import { 
  ValidationError,
  NotFoundError,
  AuthorizationError
} from '@utils/errors';
import { diff } from 'deep-object-diff';
import { DocumentType, DocumentStatus, DocumentModel, IDocument } from '../models/document.model';
import { DocumentVersionModel, IDocumentVersion } from '../models/document-version.model';

export interface CreateDocumentInput {
  title: string;
  content: string;
  type: DocumentType;
  projectId: string;
  tags?: string[];
  metadata?: Record<string, any>;
  permissions?: Array<'read' | 'write'>;
  status?: DocumentStatus;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  permissions?: Array<'read' | 'write'>;
  comment?: string;
}

export class DocumentService {
  /**
   * 创建文档
   */
  async createDocument(data: CreateDocumentInput): Promise<IDocument> {
    try {
      // 创建文档
      const document = new DocumentModel({
        ...data,
        version: 1,
        status: data.status || DocumentStatus.DRAFT
      });

      await document.save();

      // 创建第一个版本
      await this.createVersion(document, {
        comment: '初始版本'
      });

      logger.info('文档创建成功', { documentId: document.id });
      return document;
    } catch (error) {
      logger.error('文档创建失败', error);
      throw error;
    }
  }

  /**
   * 更新文档
   */
  async updateDocument(
    documentId: string, 
    data: UpdateDocumentInput,
    userId: string
  ): Promise<IDocument> {
    try {
      // 查找文档
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('文档不存在');
      }

      // 检查权限
      if (!this.hasPermission(document, userId, 'write')) {
        throw new AuthorizationError('没有编辑权限');
      }

      // 计算变更
      const changes = this.calculateChanges(document.toObject(), data);

      // 更新文档
      Object.assign(document, {
        ...data,
        version: document.version + 1,
        updatedBy: userId
      });

      await document.save();

      // 创建新版本
      await this.createVersion(document, {
        comment: data.comment,
        changes
      });

      logger.info('文档更新成功', { 
        documentId: document.id,
        version: document.version
      });

      return document;
    } catch (error) {
      logger.error('文档更新失败', error);
      throw error;
    }
  }

  /**
   * 获取文档
   */
  async getDocument(documentId: string, userId: string): Promise<IDocument> {
    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('文档不存在');
      }

      // 检查权限
      if (!this.hasPermission(document, userId, 'read')) {
        throw new AuthorizationError('没有查看权限');
      }

      return document;
    } catch (error) {
      logger.error('获取文档失败', error);
      throw error;
    }
  }

  /**
   * 获取文档列表
   */
  async getDocuments(options: {
    projectId: string;
    type?: DocumentType;
    tags?: string[];
    status?: DocumentStatus;
    page?: number;
    limit?: number;
    userId: string;
  }): Promise<{ documents: IDocument[]; total: number }> {
    try {
      const { 
        projectId,
        type,
        tags,
        status,
        page = 1,
        limit = 10,
        userId
      } = options;

      const query: any = { projectId };
      if (type) query.type = type;
      if (status) query.status = status;
      if (tags?.length) query.tags = { $all: tags };

      // 添加权限过滤
      query.$or = [
        { createdBy: userId },
        { permissions: { $in: ['read', 'write'] } }
      ];

      const [documents, total] = await Promise.all([
        DocumentModel.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ updatedAt: -1 }),
        DocumentModel.countDocuments(query)
      ]);

      return { documents, total };
    } catch (error) {
      logger.error('获取文档列表失败', error);
      throw error;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('文档不存在');
      }

      // 检查权限
      if (!this.hasPermission(document, userId, 'write')) {
        throw new AuthorizationError('没有删除权限');
      }

      // 软删除
      document.status = DocumentStatus.DELETED;
      await document.save();

      logger.info('文档删除成功', { documentId });
    } catch (error) {
      logger.error('文档删除失败', error);
      throw error;
    }
  }

  /**
   * 获取文档版本历史
   */
  async getDocumentVersions(
    documentId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ versions: IDocumentVersion[]; total: number }> {
    try {
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('文档不存在');
      }

      // 检查权限
      if (!this.hasPermission(document, userId, 'read')) {
        throw new AuthorizationError('没有查看权限');
      }

      const { page = 1, limit = 10 } = options;

      const [versions, total] = await Promise.all([
        DocumentVersionModel.find({ documentId })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ version: -1 }),
        DocumentVersionModel.countDocuments({ documentId })
      ]);

      return { versions, total };
    } catch (error) {
      logger.error('获取文档版本历史失败', error);
      throw error;
    }
  }

  /**
   * 恢复到指定版本
   */
  async restoreVersion(
    documentId: string,
    version: number,
    userId: string
  ): Promise<IDocument> {
    try {
      // 查找文档
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        throw new NotFoundError('文档不存在');
      }

      // 检查权限
      if (!this.hasPermission(document, userId, 'write')) {
        throw new AuthorizationError('没有编辑权限');
      }

      // 查找目标版本
      const targetVersion = await DocumentVersionModel.findOne({
        documentId,
        version
      });

      if (!targetVersion) {
        throw new NotFoundError('指定版本不存在');
      }

      // 更新文档
      const updateData = {
        title: targetVersion.title,
        content: targetVersion.content,
        tags: targetVersion.tags,
        metadata: targetVersion.metadata,
        version: document.version + 1,
        updatedBy: userId
      };

      Object.assign(document, updateData);
      await document.save();

      // 创建新版本
      await this.createVersion(document, {
        comment: `从版本 ${version} 恢复`
      });

      logger.info('文档版本恢复成功', {
        documentId,
        fromVersion: version,
        toVersion: document.version
      });

      return document;
    } catch (error) {
      logger.error('文档版本恢复失败', error);
      throw error;
    }
  }

  /**
   * 创建版本
   */
  private async createVersion(
    document: IDocument,
    options: {
      comment?: string;
      changes?: Array<{
        type: 'added' | 'removed' | 'modified';
        path: string;
        before?: any;
        after?: any;
      }>;
    } = {}
  ): Promise<IDocumentVersion> {
    const version = new DocumentVersionModel({
      documentId: document.id,
      version: document.version,
      title: document.title,
      content: document.content,
      tags: document.tags,
      metadata: document.metadata,
      createdBy: document.updatedBy,
      comment: options.comment,
      changes: options.changes
    });

    await version.save();
    return version;
  }

  /**
   * 计算变更
   */
  private calculateChanges(oldDoc: any, newDoc: any) {
    const changes: Array<{
      type: 'added' | 'removed' | 'modified';
      path: string;
      before?: any;
      after?: any;
    }> = [];

    const differences = diff(oldDoc, newDoc);

    for (const [path, value] of Object.entries(differences)) {
      if (value === undefined) {
        changes.push({
          type: 'removed',
          path,
          before: oldDoc[path]
        });
      } else if (oldDoc[path] === undefined) {
        changes.push({
          type: 'added',
          path,
          after: value
        });
      } else {
        changes.push({
          type: 'modified',
          path,
          before: oldDoc[path],
          after: value
        });
      }
    }

    return changes;
  }

  /**
   * 检查权限
   */
  private hasPermission(
    document: IDocument,
    userId: string,
    permission: 'read' | 'write'
  ): boolean {
    // 创建者拥有所有权限
    if (document.createdBy.toString() === userId) {
      return true;
    }

    // 检查权限列表
    return document.permissions.includes(permission);
  }
} 