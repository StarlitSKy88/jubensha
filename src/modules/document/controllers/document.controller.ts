import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { DocumentModel, DocumentSchema, DocumentType, DocumentStatus } from '../models/document.model';
import { DocumentVersionModel } from '../models/document-version.model';
import { ValidationError, NotFoundError, AuthorizationError } from '@utils/errors';
import logger from '@utils/logger';

export class DocumentController {
  // 创建文档
  async create(req: Request, res: Response) {
    try {
      const validatedData = await DocumentSchema.parseAsync(req.body);
      const document = new DocumentModel({
        ...validatedData,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      });
      await document.save();
      
      res.status(201).json({
        status: 'success',
        data: document,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
      }
      throw error;
    }
  }

  // 获取文档列表
  async list(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as DocumentType;
    const status = req.query.status as DocumentStatus;
    const search = req.query.search as string;

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .select('title type status createdBy updatedAt')
        .populate('createdBy', 'username')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        documents,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  }

  // 获取文档详情
  async get(req: Request, res: Response) {
    const document = await DocumentModel.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('updatedBy', 'username');

    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    res.json({
      status: 'success',
      data: document,
    });
  }

  // 更新文档
  async update(req: Request, res: Response) {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    // 记录变更
    const changes = this.getChanges(document.toObject(), req.body);

    // 创建新版本
    if (changes.length > 0) {
      const version = new DocumentVersionModel({
        documentId: document._id,
        version: document.version + 1,
        title: document.title,
        content: document.content,
        changes,
        createdBy: req.user.id,
      });
      await version.save();

      // 更新文档
      document.version += 1;
      Object.assign(document, req.body);
      document.updatedBy = req.user.id;
      await document.save();
    }

    res.json({
      status: 'success',
      data: document,
    });
  }

  // 删除文档
  async delete(req: Request, res: Response) {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) {
      throw new NotFoundError('文档不存在');
    }

    await DocumentModel.deleteOne({ _id: req.params.id });
    // 保留版本历史，不删除

    res.json({
      status: 'success',
      message: '文档删除成功',
    });
  }

  // 获取文档版本历史
  async getVersions(req: Request, res: Response) {
    const versions = await DocumentVersionModel.find({ documentId: req.params.id })
      .populate('createdBy', 'username')
      .sort({ version: -1 });

    res.json({
      status: 'success',
      data: versions,
    });
  }

  // 计算文档变更
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