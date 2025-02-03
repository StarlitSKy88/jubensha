import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  type: string;
  importance: number;
  location?: string;
  characters: {
    character: mongoose.Types.ObjectId;
    role: string;
  }[];
  tags: string[];
  relatedEvents?: mongoose.Types.ObjectId[];
  metadata?: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ITimelineEvent>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true
    },
    importance: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100
    },
    characters: [
      {
        character: {
          type: Schema.Types.ObjectId,
          ref: 'Character',
          required: true
        },
        role: {
          type: String,
          required: true,
          trim: true,
          maxlength: 50
        }
      }
    ],
    tags: {
      type: [String],
      index: true
    },
    relatedEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TimelineEvent'
      }
    ],
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// 索引
TimelineEventSchema.index({ projectId: 1, date: 1 });
TimelineEventSchema.index({ projectId: 1, type: 1 });
TimelineEventSchema.index({ 'characters.character': 1 });
TimelineEventSchema.index({ tags: 1 });

// 预处理：转换标签为小写
TimelineEventSchema.pre('save', function(next) {
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  next();
});

// 虚拟字段：关联事件计数
TimelineEventSchema.virtual('relatedEventCount').get(function() {
  return this.relatedEvents?.length || 0;
});

// 虚拟字段：参与角色计数
TimelineEventSchema.virtual('characterCount').get(function() {
  return this.characters?.length || 0;
});

export const TimelineEvent = mongoose.model<ITimelineEvent>('TimelineEvent', TimelineEventSchema); 