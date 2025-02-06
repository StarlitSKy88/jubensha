import { Schema, model } from 'mongoose';
import { IDocument } from '../interfaces/document.interface';

const documentSchema = new Schema<IDocument>(
  {
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
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'deleted'],
      default: 'draft'
    },
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

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
export interface IDocumentModel extends IDocument {
  id: string;
}

// 创建模型
export const DocumentModel = model<IDocumentModel>('Document', documentSchema); 