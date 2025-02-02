import { Schema, model, Document } from 'mongoose'
import { nanoid } from 'nanoid'

// 时间线事件接口
export interface ITimelineEvent extends Document {
  id: string
  projectId: string
  title: string
  description: string
  type: 'major' | 'minor' | 'background'
  date: Date
  time?: string
  duration?: number
  location?: string
  characters: string[]
  relatedEvents: string[]
  relatedClues: string[]
  importance: number
  status: 'draft' | 'published'
  order: number
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 时间线事件模式
const TimelineEventSchema = new Schema&lt;ITimelineEvent&gt;({
  id: {
    type: String,
    default: () => nanoid(),
    unique: true,
    required: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['major', 'minor', 'background'],
    default: 'major'
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true
  },
  characters: [{
    type: String,
    trim: true
  }],
  relatedEvents: [{
    type: String,
    ref: 'TimelineEvent'
  }],
  relatedClues: [{
    type: String,
    ref: 'Clue'
  }],
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  order: {
    type: Number,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// 索引
TimelineEventSchema.index({ projectId: 1, order: 1 })
TimelineEventSchema.index({ projectId: 1, date: 1 })
TimelineEventSchema.index({ projectId: 1, type: 1 })
TimelineEventSchema.index({ projectId: 1, status: 1 })
TimelineEventSchema.index({ characters: 1 })
TimelineEventSchema.index({ tags: 1 })

// 中间件
TimelineEventSchema.pre('save', async function(next) {
  if (this.isNew) {
    // 如果是新文档，设置 order 为当前项目中最大的 order + 1
    const maxOrder = await TimelineEvent.findOne({ projectId: this.projectId })
      .sort({ order: -1 })
      .select('order')
      .exec()
    this.order = maxOrder ? maxOrder.order + 1 : 0
  }
  next()
})

// 虚拟字段
TimelineEventSchema.virtual('relatedEventsData', {
  ref: 'TimelineEvent',
  localField: 'relatedEvents',
  foreignField: 'id'
})

TimelineEventSchema.virtual('relatedCluesData', {
  ref: 'Clue',
  localField: 'relatedClues',
  foreignField: 'id'
})

// 创建模型
export const TimelineEvent = model&lt;ITimelineEvent&gt;('TimelineEvent', TimelineEventSchema)

// 时间线分析结果接口
export interface ITimelineAnalysis {
  totalEvents: number
  majorEvents: number
  minorEvents: number
  backgroundEvents: number
  phases: Array<{
    name: string
    description: string
    type: string
    events: ITimelineEvent[]
    startDate: Date
    endDate: Date
  }>
  characterArcs: Array<{
    character: string
    events: ITimelineEvent[]
    arc: string
  }>
  plotPoints: Array<{
    type: string
    event: ITimelineEvent
    significance: string
  }>
}

// 一致性检查结果接口
export interface IConsistencyIssue {
  id: string
  title: string
  description: string
  type: 'error' | 'warning'
  event: ITimelineEvent
  relatedEvents?: ITimelineEvent[]
  suggestion?: string
}

export interface IConsistencyResult {
  issues: IConsistencyIssue[]
  score: number
  suggestions: string[]
}

// 优化建议接口
export interface IOptimizationSuggestion {
  id: string
  title: string
  description: string
  type: string
  relatedEvent?: ITimelineEvent
  impact: 'high' | 'medium' | 'low'
}

export interface IOptimizationResult {
  suggestions: IOptimizationSuggestion[]
  currentPacing: {
    score: number
    analysis: string
  }
  recommendedChanges: Array<{
    event: ITimelineEvent
    change: string
    reason: string
  }>
} 