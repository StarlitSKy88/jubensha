import { Types } from 'mongoose';
import { DocumentModel } from '../models/document.model';
import { DocumentVersionModel } from '../models/document-version.model';
import { DocumentError, DocumentNotFoundError, DocumentValidationError } from '../errors/document.error';
import { IDocument, IDocumentVersion } from '../interfaces/document.interface';
import { diff } from 'deep-object-diff';

export class DocumentService {
  // 创建文档
  async createDocument(data: {
    title: string;
    content: string;
    type: string;
    tags?: string[];
    createdBy: string;
  }): Promise<IDocument> {
    try {
      const document = await DocumentModel.create({
        ...data,
        version: 1,
        status: 'draft'
      });

      // 创建初始版本
      await this.createVersion(document, {
        comment: '初始版本'
      });

      return document;
    } catch (error) {
      throw new DocumentValidationError(error.message);
    }
  }

  // 更新文档
  async updateDocument(
    documentId: string,
    data: {
      title?: string;
      content?: string;
      type?: string;
      tags?: string[];
      status?: string;
    },
    userId: string
  ): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new DocumentNotFoundError(documentId);
    }

    const oldDoc = document.toObject();
    Object.assign(document, data);
    document.version += 1;
    document.updatedBy = userId;

    try {
      await document.save();

      // 创建新版本
      const changes = this.calculateChanges(oldDoc, document.toObject());
      await this.createVersion(document, {
        changes,
        comment: data.comment || `更新版本 ${document.version}`
      });

      return document;
    } catch (error) {
      throw new DocumentValidationError(error.message);
    }
  }

  // 获取文档
  async getDocument(documentId: string): Promise<IDocument> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new DocumentNotFoundError(documentId);
    }
    return document;
  }

  // 获取文档列表
  async getDocuments(options: {
    type?: string;
    tags?: string[];
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ documents: IDocument[]; total: number }> {
    const { type, tags, status, page = 1, limit = 10 } = options;

    const query: any = {};
    if (type) query.type = type;
    if (tags?.length) query.tags = { $in: tags };
    if (status) query.status = status;

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      DocumentModel.countDocuments(query)
    ]);

    return { documents, total };
  }

  // 删除文档
  async deleteDocument(documentId: string): Promise<void> {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new DocumentNotFoundError(documentId);
    }

    await document.updateOne({ status: 'deleted' });
  }

  // 获取文档版本历史
  async getDocumentVersions(
    documentId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ versions: IDocumentVersion[]; total: number }> {
    const { page = 1, limit = 10 } = options;

    const [versions, total] = await Promise.all([
      DocumentVersionModel.find({ documentId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ version: -1 }),
      DocumentVersionModel.countDocuments({ documentId })
    ]);

    return { versions, total };
  }

  // 创建版本记录
  private async createVersion(
    document: IDocument,
    options: {
      changes?: Array<{
        type: string;
        path: string;
        before?: any;
        after?: any;
      }>;
      comment?: string;
    }
  ): Promise<IDocumentVersion> {
    const version = await DocumentVersionModel.create({
      documentId: document._id,
      version: document.version,
      title: document.title,
      content: document.content,
      changes: options.changes || [],
      comment: options.comment,
      createdBy: document.updatedBy
    });

    return version;
  }

  // 计算文档变更
  private calculateChanges(oldDoc: any, newDoc: any) {
    const changes = diff(oldDoc, newDoc);
    return Object.entries(changes).map(([path, value]) => ({
      type: oldDoc[path] === undefined ? 'added' : 'modified',
      path,
      before: oldDoc[path],
      after: value
    }));
  }
} 