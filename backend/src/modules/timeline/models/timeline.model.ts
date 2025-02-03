import { Schema, model, Document, Types } from 'mongoose';

export interface ITimelineEvent extends Document {
  title: string;
  description: string;
  date: Date;
  characters: Types.ObjectId[];
  location?: string;
  importance: number;
  tags?: string[];
  relatedEvents?: Types.ObjectId[];
  creator: Types.ObjectId;
  projectId: Types.ObjectId;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const timelineEventSchema = new Schema<ITimelineEvent>({
  title: {
    type: String,
    required: [true, '事件标题是必需的'],
    trim: true,
    minlength: [2, '事件标题至少需要2个字符'],
    maxlength: [100, '事件标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '事件描述是必需的'],
    trim: true,
    maxlength: [2000, '事件描述不能超过2000个字符']
  },
  date: {
    type: Date,
    required: [true, '事件日期是必需的'],
    index: true
  },
  characters: [{
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, '地点名称不能超过100个字符']
  },
  importance: {
    type: Number,
    required: true,
    min: [1, '重要性最小值为1'],
    max: [5, '重要性最大值为5'],
    default: 3
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'TimelineEvent'
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// 索引优化
timelineEventSchema.index({ projectId: 1, date: 1 });
timelineEventSchema.index({ characters: 1 });
timelineEventSchema.index({ tags: 1 });
timelineEventSchema.index({ creator: 1 });
timelineEventSchema.index({ isPublic: 1 });

export const TimelineEvent = model<ITimelineEvent>('TimelineEvent', timelineEventSchema); 