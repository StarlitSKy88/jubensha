import { ref } from 'vue'
import type { Ref } from 'vue'
import type { Script } from './script.service'

// 作家信息
export interface Writer {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  specialties: string[]
  scripts: string[]
  followers: string[]
  following: string[]
  stats: {
    totalScripts: number
    publishedScripts: number
    totalLikes: number
    averageRating: number
  }
  settings: {
    language: string
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    autoSave: boolean
  }
}

// 作品评论
export interface Comment {
  id: string
  writerId: string
  scriptId: string
  content: string
  rating: number
  createdAt: Date
  updatedAt: Date
  likes: number
  replies: Comment[]
}

// 作家服务
export class WriterService {
  private writers = ref<Map<string, Writer>>(new Map())
  private comments = ref<Map<string, Comment[]>>(new Map())
  private currentWriter: Ref<string | null> = ref(null)

  // 创建作家
  createWriter(name: string, email: string): Writer {
    const writer: Writer = {
      id: crypto.randomUUID(),
      name,
      email,
      specialties: [],
      scripts: [],
      followers: [],
      following: [],
      stats: {
        totalScripts: 0,
        publishedScripts: 0,
        totalLikes: 0,
        averageRating: 0
      },
      settings: {
        language: 'zh-CN',
        theme: 'system',
        notifications: true,
        autoSave: true
      }
    }

    this.writers.value.set(writer.id, writer)
    this.currentWriter.value = writer.id
    return writer
  }

  // 更新作家信息
  updateWriter(writerId: string, updates: Partial<Omit<Writer, 'id'>>): Writer {
    const writer = this.getWriter(writerId)
    if (!writer) {
      throw new Error('作家不存在')
    }

    Object.assign(writer, updates)
    return writer
  }

  // 删除作家
  deleteWriter(writerId: string): void {
    if (!this.writers.value.delete(writerId)) {
      throw new Error('作家不存在')
    }

    if (this.currentWriter.value === writerId) {
      this.currentWriter.value = null
    }
  }

  // 添加剧本
  addScript(writerId: string, scriptId: string): void {
    const writer = this.getWriter(writerId)
    if (!writer) {
      throw new Error('作家不存在')
    }

    if (!writer.scripts.includes(scriptId)) {
      writer.scripts.push(scriptId)
      writer.stats.totalScripts++
    }
  }

  // 发布剧本
  publishScript(writerId: string, scriptId: string): void {
    const writer = this.getWriter(writerId)
    if (!writer) {
      throw new Error('作家不存在')
    }

    if (!writer.scripts.includes(scriptId)) {
      throw new Error('剧本不存在')
    }

    writer.stats.publishedScripts++
  }

  // 关注作家
  followWriter(followerId: string, targetId: string): void {
    const follower = this.getWriter(followerId)
    const target = this.getWriter(targetId)

    if (!follower || !target) {
      throw new Error('作家不存在')
    }

    if (followerId === targetId) {
      throw new Error('不能关注自己')
    }

    if (!follower.following.includes(targetId)) {
      follower.following.push(targetId)
      target.followers.push(followerId)
    }
  }

  // 取消关注
  unfollowWriter(followerId: string, targetId: string): void {
    const follower = this.getWriter(followerId)
    const target = this.getWriter(targetId)

    if (!follower || !target) {
      throw new Error('作家不存在')
    }

    const followingIndex = follower.following.indexOf(targetId)
    const followerIndex = target.followers.indexOf(followerId)

    if (followingIndex !== -1) {
      follower.following.splice(followingIndex, 1)
      target.followers.splice(followerIndex, 1)
    }
  }

  // 添加评论
  addComment(writerId: string, scriptId: string, content: string, rating: number): Comment {
    const writer = this.getWriter(writerId)
    if (!writer) {
      throw new Error('作家不存在')
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      writerId,
      scriptId,
      content,
      rating,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: []
    }

    if (!this.comments.value.has(scriptId)) {
      this.comments.value.set(scriptId, [])
    }

    this.comments.value.get(scriptId)!.push(comment)
    this.updateScriptStats(scriptId)

    return comment
  }

  // 更新评论
  updateComment(commentId: string, scriptId: string, updates: Partial<Pick<Comment, 'content' | 'rating'>>): Comment {
    const comments = this.comments.value.get(scriptId)
    if (!comments) {
      throw new Error('评论不存在')
    }

    const comment = comments.find(c => c.id === commentId)
    if (!comment) {
      throw new Error('评论不存在')
    }

    Object.assign(comment, updates, { updatedAt: new Date() })
    this.updateScriptStats(scriptId)

    return comment
  }

  // 删除评论
  deleteComment(commentId: string, scriptId: string): void {
    const comments = this.comments.value.get(scriptId)
    if (!comments) {
      throw new Error('评论不存在')
    }

    const index = comments.findIndex(c => c.id === commentId)
    if (index === -1) {
      throw new Error('评论不存在')
    }

    comments.splice(index, 1)
    this.updateScriptStats(scriptId)
  }

  // 点赞评论
  likeComment(commentId: string, scriptId: string): void {
    const comments = this.comments.value.get(scriptId)
    if (!comments) {
      throw new Error('评论不存在')
    }

    const comment = comments.find(c => c.id === commentId)
    if (!comment) {
      throw new Error('评论不存在')
    }

    comment.likes++
  }

  // 回复评论
  replyToComment(parentId: string, scriptId: string, writerId: string, content: string): Comment {
    const comments = this.comments.value.get(scriptId)
    if (!comments) {
      throw new Error('评论不存在')
    }

    const parent = comments.find(c => c.id === parentId)
    if (!parent) {
      throw new Error('评论不存在')
    }

    const reply: Comment = {
      id: crypto.randomUUID(),
      writerId,
      scriptId,
      content,
      rating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: []
    }

    parent.replies.push(reply)
    return reply
  }

  // 获取作家
  getWriter(id: string): Writer | undefined {
    return this.writers.value.get(id)
  }

  // 获取当前作家
  getCurrentWriter(): Writer | undefined {
    return this.currentWriter.value ? this.writers.value.get(this.currentWriter.value) : undefined
  }

  // 获取所有作家
  getAllWriters(): Writer[] {
    return Array.from(this.writers.value.values())
  }

  // 获取剧本评论
  getScriptComments(scriptId: string): Comment[] {
    return this.comments.value.get(scriptId) || []
  }

  // 更新剧本统计信息
  private updateScriptStats(scriptId: string): void {
    const comments = this.comments.value.get(scriptId) || []
    const totalRating = comments.reduce((sum, comment) => sum + comment.rating, 0)
    const averageRating = comments.length > 0 ? totalRating / comments.length : 0

    // 更新作家统计信息
    const writer = this.getWriter(comments[0]?.writerId)
    if (writer) {
      writer.stats.averageRating = averageRating
      writer.stats.totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0)
    }
  }
} 