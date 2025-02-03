import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineView extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  filters: {
    startDate?: Date;
    endDate?: Date;
    characters?: mongoose.Types.ObjectId[];
    tags?: string[];
    eventTypes?: string[];
  };
  display: {
    groupBy: 'character' | 'date' | 'type';
    sortBy: 'date' | 'importance';
    sortOrder: 'asc' | 'desc';
    showDetails: boolean;
    colorScheme: string;
  };
  layout: {
    type: 'vertical' | 'horizontal';
    scale: 'linear' | 'logarithmic';
    density: 'compact' | 'comfortable';
    showLabels: boolean;
    showConnections: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineViewSchema = new Schema<ITimelineView>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    filters: {
      startDate: Date,
      endDate: Date,
      characters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
      tags: [String],
      eventTypes: [String]
    },
    display: {
      groupBy: {
        type: String,
        enum: ['character', 'date', 'type'],
        default: 'date'
      },
      sortBy: {
        type: String,
        enum: ['date', 'importance'],
        default: 'date'
      },
      sortOrder: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'asc'
      },
      showDetails: {
        type: Boolean,
        default: true
      },
      colorScheme: {
        type: String,
        default: 'default'
      }
    },
    layout: {
      type: {
        type: String,
        enum: ['vertical', 'horizontal'],
        default: 'horizontal'
      },
      scale: {
        type: String,
        enum: ['linear', 'logarithmic'],
        default: 'linear'
      },
      density: {
        type: String,
        enum: ['compact', 'comfortable'],
        default: 'comfortable'
      },
      showLabels: {
        type: Boolean,
        default: true
      },
      showConnections: {
        type: Boolean,
        default: true
      }
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
TimelineViewSchema.index({ projectId: 1, name: 1 }, { unique: true });
TimelineViewSchema.index({ createdBy: 1 });
TimelineViewSchema.index({ updatedAt: -1 });

// 虚拟字段：事件计数
TimelineViewSchema.virtual('eventCount').get(function(this: ITimelineView) {
  // 这里将在服务层实现事件计数逻辑
  return 0;
});

export const TimelineView = mongoose.model<ITimelineView>('TimelineView', TimelineViewSchema); 