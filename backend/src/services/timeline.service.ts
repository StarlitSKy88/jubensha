import { TimelineEvent, ITimelineEvent, ITimelineAnalysis, IConsistencyResult, IOptimizationResult, IConsistencyIssue } from '../models/timeline.model'
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'

export class TimelineService {
  private timelineModel: Model<ITimelineEvent>

  constructor() {
    this.timelineModel = TimelineEvent
  }

  // 基础 CRUD 操作
  async getEvents(projectId?: string): Promise<ITimelineEvent[]> {
    const query = projectId ? { projectId } : {}
    return this.timelineModel.find(query)
      .sort({ order: 1 })
      .populate('relatedEventsData')
      .populate('relatedCluesData')
      .exec()
  }

  async getEvent(id: string): Promise<ITimelineEvent | null> {
    return this.timelineModel.findOne({ id })
      .populate('relatedEventsData')
      .populate('relatedCluesData')
      .exec()
  }

  async createEvent(eventData: Partial<ITimelineEvent>): Promise<ITimelineEvent> {
    const event = new this.timelineModel({
      ...eventData,
      id: nanoid()
    })
    return event.save()
  }

  async updateEvent(id: string, eventData: Partial<ITimelineEvent>): Promise<ITimelineEvent | null> {
    return this.timelineModel.findOneAndUpdate(
      { id },
      { $set: eventData },
      { new: true }
    )
      .populate('relatedEventsData')
      .populate('relatedCluesData')
      .exec()
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await this.timelineModel.deleteOne({ id })
    return result.deletedCount > 0
  }

  // 事件关系管理
  async addEventRelation(eventId: string, relatedEventId: string): Promise<void> {
    await this.timelineModel.updateOne(
      { id: eventId },
      { $addToSet: { relatedEvents: relatedEventId } }
    )
  }

  async removeEventRelation(eventId: string, relatedEventId: string): Promise<void> {
    await this.timelineModel.updateOne(
      { id: eventId },
      { $pull: { relatedEvents: relatedEventId } }
    )
  }

  async getRelatedEvents(eventId: string): Promise<ITimelineEvent[]> {
    const event = await this.timelineModel.findOne({ id: eventId })
      .populate('relatedEventsData')
      .exec()
    return event?.relatedEvents || []
  }

  // 事件顺序管理
  async updateEventsOrder(events: Array<{ id: string; order: number }>): Promise<void> {
    const bulkOps = events.map(({ id, order }) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order } }
      }
    }))
    await this.timelineModel.bulkWrite(bulkOps)
  }

  // 时间线分析
  async analyzeTimeline(projectId?: string): Promise<ITimelineAnalysis> {
    const events = await this.getEvents(projectId)
    
    // 基础统计
    const totalEvents = events.length
    const majorEvents = events.filter(e => e.type === 'major').length
    const minorEvents = events.filter(e => e.type === 'minor').length
    const backgroundEvents = events.filter(e => e.type === 'background').length

    // 分析阶段
    const phases = this.analyzePhases(events)
    
    // 分析角色弧线
    const characterArcs = this.analyzeCharacterArcs(events)
    
    // 分析关键情节点
    const plotPoints = this.analyzePlotPoints(events)

    return {
      totalEvents,
      majorEvents,
      minorEvents,
      backgroundEvents,
      phases,
      characterArcs,
      plotPoints
    }
  }

  private analyzePhases(events: ITimelineEvent[]) {
    // 按时间排序
    const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // 简单的阶段划分（这里可以使用更复杂的算法）
    const phaseLength = Math.ceil(sortedEvents.length / 3)
    
    return [
      {
        name: '开始阶段',
        description: '故事的开端和背景设置',
        type: 'setup',
        events: sortedEvents.slice(0, phaseLength),
        startDate: sortedEvents[0]?.date,
        endDate: sortedEvents[phaseLength - 1]?.date
      },
      {
        name: '发展阶段',
        description: '冲突的展开和升级',
        type: 'development',
        events: sortedEvents.slice(phaseLength, phaseLength * 2),
        startDate: sortedEvents[phaseLength]?.date,
        endDate: sortedEvents[phaseLength * 2 - 1]?.date
      },
      {
        name: '高潮阶段',
        description: '冲突的解决和故事的结局',
        type: 'climax',
        events: sortedEvents.slice(phaseLength * 2),
        startDate: sortedEvents[phaseLength * 2]?.date,
        endDate: sortedEvents[sortedEvents.length - 1]?.date
      }
    ]
  }

  private analyzeCharacterArcs(events: ITimelineEvent[]) {
    // 获取所有角色
    const characters = new Set(events.flatMap(e => e.characters))
    
    return Array.from(characters).map(character => {
      const characterEvents = events.filter(e => e.characters.includes(character))
      return {
        character,
        events: characterEvents,
        arc: this.determineCharacterArc(characterEvents)
      }
    })
  }

  private determineCharacterArc(events: ITimelineEvent[]) {
    // 这里可以实现更复杂的角色弧线分析
    return '待分析'
  }

  private analyzePlotPoints(events: ITimelineEvent[]) {
    return events
      .filter(e => e.type === 'major')
      .map(event => ({
        type: 'key_event',
        event,
        significance: '关键转折点' // 这里可以添加更详细的分析
      }))
  }

  // 一致性检查
  async checkConsistency(projectId?: string): Promise<IConsistencyResult> {
    const events = await this.getEvents(projectId)
    const issues: IConsistencyIssue[] = []
    let score = 100

    // 检查时间顺序
    const timeIssues = this.checkTimeConsistency(events)
    issues.push(...timeIssues)
    score -= timeIssues.length * 5

    // 检查角色一致性
    const characterIssues = this.checkCharacterConsistency(events)
    issues.push(...characterIssues)
    score -= characterIssues.length * 3

    // 检查事件关联
    const relationIssues = this.checkRelationConsistency(events)
    issues.push(...relationIssues)
    score -= relationIssues.length * 2

    return {
      issues,
      score: Math.max(0, score),
      suggestions: this.generateConsistencySuggestions(issues)
    }
  }

  private checkTimeConsistency(events: ITimelineEvent[]): IConsistencyIssue[] {
    const issues: IConsistencyIssue[] = []
    const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime())

    for (let i = 1; i < sortedEvents.length; i++) {
      const prevEvent = sortedEvents[i - 1]
      const currEvent = sortedEvents[i]

      if (prevEvent.order > currEvent.order) {
        issues.push({
          id: nanoid(),
          title: '时间顺序不一致',
          description: `事件 "${currEvent.title}" 的时间早于前一个事件 "${prevEvent.title}"，但顺序号较大`,
          type: 'warning',
          event: currEvent,
          relatedEvents: [prevEvent],
          suggestion: '建议调整事件顺序以匹配时间线'
        })
      }
    }

    return issues
  }

  private checkCharacterConsistency(events: ITimelineEvent[]): IConsistencyIssue[] {
    const issues: IConsistencyIssue[] = []
    const characterTimelines = new Map<string, ITimelineEvent[]>()

    // 构建每个角色的时间线
    events.forEach(event => {
      event.characters.forEach(character => {
        if (!characterTimelines.has(character)) {
          characterTimelines.set(character, [])
        }
        characterTimelines.get(character)?.push(event)
      })
    })

    // 检查每个角色的时间线是否合理
    characterTimelines.forEach((timeline, character) => {
      const sortedTimeline = [...timeline].sort((a, b) => a.date.getTime() - b.date.getTime())

      // 检查角色出场间隔是否过长
      for (let i = 1; i < sortedTimeline.length; i++) {
        const prevEvent = sortedTimeline[i - 1]
        const currEvent = sortedTimeline[i]
        const gap = currEvent.date.getTime() - prevEvent.date.getTime()
        
        if (gap > 30 * 24 * 60 * 60 * 1000) { // 30天
          issues.push({
            id: nanoid(),
            title: '角色出场间隔过长',
            description: `角色 "${character}" 在事件 "${prevEvent.title}" 和 "${currEvent.title}" 之间的出场间隔超过30天`,
            type: 'warning',
            event: currEvent,
            relatedEvents: [prevEvent],
            suggestion: '考虑在这段时间内添加该角色的相关事件'
          })
        }
      }
    })

    return issues
  }

  private checkRelationConsistency(events: ITimelineEvent[]): IConsistencyIssue[] {
    const issues: IConsistencyIssue[] = []
    const eventMap = new Map(events.map(e => [e.id, e]))

    events.forEach(event => {
      // 检查关联事件是否存在
      event.relatedEvents.forEach(relatedId => {
        if (!eventMap.has(relatedId)) {
          issues.push({
            id: nanoid(),
            title: '关联事件不存在',
            description: `事件 "${event.title}" 关联的事件 ID "${relatedId}" 不存在`,
            type: 'error',
            event,
            suggestion: '移除无效的事件关联'
          })
        }
      })

      // 检查关联是否双向
      event.relatedEvents.forEach(relatedId => {
        const relatedEvent = eventMap.get(relatedId)
        if (relatedEvent && !relatedEvent.relatedEvents.includes(event.id)) {
          issues.push({
            id: nanoid(),
            title: '事件关联不对称',
            description: `事件 "${event.title}" 与 "${relatedEvent.title}" 的关联不是双向的`,
            type: 'warning',
            event,
            relatedEvents: [relatedEvent],
            suggestion: '添加反向关联以保持一致性'
          })
        }
      })
    })

    return issues
  }

  private generateConsistencySuggestions(issues: IConsistencyIssue[]) {
    const suggestions = new Set<string>()
    
    issues.forEach(issue => {
      if (issue.suggestion) {
        suggestions.add(issue.suggestion)
      }
    })

    return Array.from(suggestions)
  }

  // 节奏优化
  async optimizeTimeline(projectId?: string): Promise<IOptimizationResult> {
    const events = await this.getEvents(projectId)
    const suggestions = []
    let score = 0
    let analysis = ''

    // 分析当前节奏
    const { pacingScore, pacingAnalysis } = this.analyzePacing(events)
    score = pacingScore
    analysis = pacingAnalysis

    // 生成优化建议
    const recommendedChanges = this.generateOptimizationSuggestions(events)

    return {
      suggestions,
      currentPacing: {
        score,
        analysis
      },
      recommendedChanges
    }
  }

  private analyzePacing(events: ITimelineEvent[]) {
    // 这里可以实现更复杂的节奏分析算法
    const pacingScore = 75 // 示例分数
    const pacingAnalysis = '节奏基本合理，但可以适当调整以提高张力'

    return { pacingScore, pacingAnalysis }
  }

  private generateOptimizationSuggestions(events: ITimelineEvent[]) {
    // 这里可以实现更复杂的优化建议生成算法
    return events
      .filter(e => e.type === 'major')
      .map(event => ({
        event,
        change: '建议调整事件节奏',
        reason: '提高故事张力'
      }))
  }

  // 导入导出
  async exportTimeline(projectId?: string): Promise<ITimelineEvent[]> {
    return this.getEvents(projectId)
  }

  async importTimeline(events: ITimelineEvent[]): Promise<void> {
    const session = await this.timelineModel.startSession()
    
    try {
      await session.withTransaction(async () => {
        // 清除现有事件
        if (events.length > 0) {
          const projectId = events[0].projectId
          await this.timelineModel.deleteMany({ projectId })
        }

        // 导入新事件
        await this.timelineModel.insertMany(events)
      })
    } finally {
      await session.endSession()
    }
  }
} 