import { Types } from 'mongoose';
import { DocumentModel, DocumentType, DocumentStatus } from '../models/document.model';
import { DocumentVersionModel } from '../models/document-version.model';
import { NotFoundError, ValidationError } from '@utils/errors';
import logger from '@utils/logger';

export interface CreateDocumentInput {
  title: string;
  content: string;
  type: DocumentType;
  tags?: string[];
  projectId: Types.ObjectId;
  createdBy: Types.ObjectId;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  type?: DocumentType;
  tags?: string[];
  status?: DocumentStatus;
}

export class DocumentService {
  async createDocument(data: CreateDocumentInput) {
    try {
      const document = new DocumentModel({
        ...data,
        updatedBy: data.createdBy,
        version: 1,
        status: DocumentStatus.DRAFT,
      });

      await document.save();

      // 创建初始版本
      const version = new DocumentVersionModel({
        documentId: document._id,
        version: 1,
        title: document.title,
        content: document.content,
        changes: [],
        createdBy: data.createdBy,
      });

      await version.save();

      return document;
    } catch (error) {
      logger.error('创建文档失败:', error);
      throw error;
    }
  }

  async updateDocument(
    documentId: string,
    data: UpdateDocumentInput,
    userId: Types.ObjectId
  ) {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    // 记录变更
    const changes = this.getChanges(document.toObject(), data);

    // 创建新版本
    if (changes.length > 0) {
      const version = new DocumentVersionModel({
        documentId: document._id,
        version: document.version + 1,
        title: document.title,
        content: document.content,
        changes,
        createdBy: userId,
      });

      await version.save();

      // 更新文档
      document.version += 1;
      Object.assign(document, data);
      document.updatedBy = userId;
      await document.save();
    }

    return document;
  }

  async getDocument(documentId: string) {
    const document = await DocumentModel.findById(documentId)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    return document;
  }

  async getDocuments(options: {
    projectId: Types.ObjectId;
    type?: DocumentType;
    status?: DocumentStatus;
    page?: number;
    limit?: number;
  }) {
    const { projectId, type, status, page = 1, limit = 10 } = options;

    const query: Record<string, unknown> = { projectId };
    if (type) query.type = type;
    if (status) query.status = status;

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .populate('createdBy', 'username')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(query),
    ]);

    return { documents, total };
  }

  async deleteDocument(documentId: string) {
    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    await DocumentModel.deleteOne({ _id: documentId });
  }

  async getDocumentVersions(
    documentId: string,
    userId: Types.ObjectId,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 10 } = options;

    const document = await DocumentModel.findById(documentId);
    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    const [versions, total] = await Promise.all([
      DocumentVersionModel.find({ documentId })
        .populate('createdBy', 'username')
        .sort({ version: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DocumentVersionModel.countDocuments({ documentId }),
    ]);

    return { versions, total };
  }

  private getChanges(oldDoc: Record<string, unknown>, newDoc: Record<string, unknown>) {
    const changes = [];
    for (const [key, value] of Object.entries(newDoc)) {
      if (oldDoc[key] !== value) {
        changes.push({
          field: key,
          oldValue: oldDoc[key],
          newValue: value,
        });
      }
    }
    return changes;
  }
} 