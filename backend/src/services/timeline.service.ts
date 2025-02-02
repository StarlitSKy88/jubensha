import { TimelineEvent, ITimelineEvent, ITimelineAnalysis, IConsistencyResult, IOptimizationResult, IConsistencyIssue } from '../models/timeline.model'
import { Model } from 'mongoose'
import { nanoid } from 'nanoid'
import { BusinessError } from '../utils/errors'
import { validateId } from '../utils/validators'

export class TimelineService {
  private timelineModel: Model<ITimelineEvent>

  constructor() {
    this.timelineModel = TimelineEvent
  }

  /**
   * 获取时间线事件列表
   */
  async getEvents(projectId?: string): Promise<ITimelineEvent[]> {
    const query = projectId ? { projectId } : {}
    return this.timelineModel.find(query).sort({ date: 1, order: 1 })
  }

  /**
   * 获取单个事件
   */
  async getEvent(id: string): Promise<ITimelineEvent | null> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的事件ID', 400)
    }
    return this.timelineModel.findOne({ id })
  }

  /**
   * 创建事件
   */
  async createEvent(eventData: Omit<ITimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITimelineEvent> {
    // 验证必填字段
    if (!eventData.title || !eventData.date) {
      throw new BusinessError('VALIDATION_ERROR', '事件标题和日期为必填项', 400)
    }

    // 检查同一项目下是否有同名事件
    const existingEvent = await this.timelineModel.findOne({
      projectId: eventData.projectId,
      title: eventData.title
    })

    if (existingEvent) {
      throw new BusinessError('CONFLICT', '事件标题已存在', 409)
    }

    // 获取最大顺序号
    const maxOrderEvent = await this.timelineModel
      .findOne({ projectId: eventData.projectId })
      .sort({ order: -1 })

    const order = maxOrderEvent ? maxOrderEvent.order + 1 : 0

    // 创建事件
    const event = new this.timelineModel({
      ...eventData,
      order
    })

    return event.save()
  }

  /**
   * 更新事件
   */
  async updateEvent(id: string, eventData: Partial<ITimelineEvent>): Promise<ITimelineEvent | null> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的事件ID', 400)
    }

    // 检查事件是否存在
    const event = await this.timelineModel.findOne({ id })
    if (!event) {
      throw new BusinessError('NOT_FOUND', '事件不存在', 404)
    }

    // 如果更新标题，检查是否重复
    if (eventData.title && eventData.title !== event.title) {
      const existingEvent = await this.timelineModel.findOne({
        projectId: event.projectId,
        title: eventData.title,
        id: { $ne: id }
      })

      if (existingEvent) {
        throw new BusinessError('CONFLICT', '事件标题已存在', 409)
      }
    }

    // 更新事件
    return this.timelineModel.findOneAndUpdate(
      { id },
      { $set: eventData },
      { new: true, runValidators: true }
    )
  }

  /**
   * 删除事件
   */
  async deleteEvent(id: string): Promise<boolean> {
    if (!validateId(id)) {
      throw new BusinessError('VALIDATION_ERROR', '无效的事件ID', 400)
    }

    const result = await this.timelineModel.deleteOne({ id })
    return result.deletedCount > 0
  }

  /**
   * 获取相关事件
   */
  async getRelatedEvents(eventId: string): Promise<ITimelineEvent[]> {
    const event = await this.timelineModel.findOne({ id: eventId })
    if (!event) {
      throw new BusinessError('NOT_FOUND', '事件不存在', 404)
    }

    return this.timelineModel.find({
      id: { $in: event.relatedEvents }
    })
  }

  /**
   * 添加事件关联
   */
  async addEventRelation(eventId: string, relatedEventId: string): Promise<void> {
    // 检查两个事件是否存在
    const [event, relatedEvent] = await Promise.all([
      this.timelineModel.findOne({ id: eventId }),
      this.timelineModel.findOne({ id: relatedEventId })
    ])

    if (!event || !relatedEvent) {
      throw new BusinessError('NOT_FOUND', '事件不存在', 404)
    }

    // 检查关联是否已存在
    if (event.relatedEvents.includes(relatedEventId)) {
      throw new BusinessError('CONFLICT', '事件关联已存在', 409)
    }

    // 添加关联
    await this.timelineModel.updateOne(
      { id: eventId },
      { $push: { relatedEvents: relatedEventId } }
    )
  }

  /**
   * 删除事件关联
   */
  async removeEventRelation(eventId: string, relatedEventId: string): Promise<void> {
    // 检查事件是否存在
    const event = await this.timelineModel.findOne({ id: eventId })
    if (!event) {
      throw new BusinessError('NOT_FOUND', '事件不存在', 404)
    }

    // 删除关联
    await this.timelineModel.updateOne(
      { id: eventId },
      { $pull: { relatedEvents: relatedEventId } }
    )
  }

  /**
   * 更新事件顺序
   */
  async updateEventsOrder(events: Array<{ id: string; order: number }>): Promise<void> {
    // 验证事件ID
    for (const event of events) {
      if (!validateId(event.id)) {
        throw new BusinessError('VALIDATION_ERROR', '无效的事件ID', 400)
      }
    }

    // 批量更新事件顺序
    await Promise.all(
      events.map(event =>
        this.timelineModel.updateOne(
          { id: event.id },
          { $set: { order: event.order } }
        )
      )
    )
  }

  /**
   * 分析时间线
   */
  async analyzeTimeline(projectId?: string): Promise<{
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
  }> {
    // 获取所有事件
    const query = projectId ? { projectId } : {}
    const events = await this.timelineModel.find(query).sort({ date: 1 })

    // 统计事件类型
    const stats = {
      totalEvents: events.length,
      majorEvents: events.filter(e => e.type === 'major').length,
      minorEvents: events.filter(e => e.type === 'minor').length,
      backgroundEvents: events.filter(e => e.type === 'background').length
    }

    // 分析阶段
    const phases = this.analyzePhases(events)

    // 分析角色弧线
    const characterArcs = this.analyzeCharacterArcs(events)

    // 分析关键情节点
    const plotPoints = this.analyzePlotPoints(events)

    return {
      ...stats,
      phases,
      characterArcs,
      plotPoints
    }
  }

  /**
   * 分析阶段
   */
  private analyzePhases(events: ITimelineEvent[]) {
    // 按时间分组
    const phases: Array<{
      name: string
      description: string
      type: string
      events: ITimelineEvent[]
      startDate: Date
      endDate: Date
    }> = []

    let currentPhase = {
      name: '开始阶段',
      description: '故事的开始',
      type: 'setup',
      events: [] as ITimelineEvent[],
      startDate: events[0]?.date,
      endDate: events[0]?.date
    }

    for (const event of events) {
      // 根据事件类型和时间间隔判断是否需要开始新阶段
      if (
        event.type === 'major' &&
        currentPhase.events.length > 0 &&
        Math.abs(event.date.getTime() - currentPhase.events[0].date.getTime()) > 30 * 24 * 60 * 60 * 1000
      ) {
        phases.push(currentPhase)
        currentPhase = {
          name: `新阶段 ${phases.length + 1}`,
          description: '',
          type: 'development',
          events: [],
          startDate: event.date,
          endDate: event.date
        }
      }

      currentPhase.events.push(event)
      currentPhase.endDate = event.date
    }

    phases.push(currentPhase)
    return phases
  }

  /**
   * 分析角色弧线
   */
  private analyzeCharacterArcs(events: ITimelineEvent[]) {
    const characterArcs: Array<{
      character: string
      events: ITimelineEvent[]
      arc: string
    }> = []

    // 获取所有角色
    const characters = new Set<string>()
    events.forEach(event => {
      event.characters.forEach(character => characters.add(character))
    })

    // 分析每个角色的弧线
    characters.forEach(character => {
      const characterEvents = events.filter(event =>
        event.characters.includes(character)
      )

      if (characterEvents.length > 0) {
        characterArcs.push({
          character,
          events: characterEvents,
          arc: this.determineCharacterArc(characterEvents)
        })
      }
    })

    return characterArcs
  }

  /**
   * 确定角色弧线类型
   */
  private determineCharacterArc(events: ITimelineEvent[]): string {
    // 根据事件类型和顺序判断角色弧线
    // 这里是一个简单的实现，实际项目中可能需要更复杂的逻辑
    const majorEvents = events.filter(e => e.type === 'major')
    if (majorEvents.length === 0) return '配角'
    if (majorEvents.length >= 3) return '主要角色'
    return '次要角色'
  }

  /**
   * 分析关键情节点
   */
  private analyzePlotPoints(events: ITimelineEvent[]) {
    return events
      .filter(event => event.type === 'major')
      .map(event => ({
        type: 'plot_point',
        event,
        significance: '关键情节转折点'
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