import mongoose, { Schema, Document } from 'mongoose';
import { IDocument, DocumentType, DocumentStatus } from '@interfaces/document.interface';

const documentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['script', 'rule', 'note']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// 索引
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ type: 1, status: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ createdBy: 1 });
documentSchema.index({ updatedAt: -1 });

// 虚拟字段
documentSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// 序列化配置
documentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

// 中间件
documentSchema.pre('save', async function(next) {
  if (this.isNew) {
    this.updatedBy = this.createdBy;
  }
  next();
});

// 接口定义
export interface IDocumentModel extends IDocument, Document {
  id: string;
}

// 创建模型
export const DocumentModel = mongoose.model<IDocumentModel>('Document', documentSchema); 