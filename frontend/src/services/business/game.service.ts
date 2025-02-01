import { ref } from 'vue'
import type { Script, Scene, Character } from './script.service'

// 游戏状态
export type GameStatus = 'preparing' | 'running' | 'paused' | 'finished'

// 玩家信息
export interface Player {
  id: string
  name: string
  characterId: string
  isHost: boolean
  isReady: boolean
  connection: {
    status: 'connected' | 'disconnected'
    lastSeen: Date
  }
}

// 游戏进度
export interface GameProgress {
  currentScene: string
  elapsedTime: number
  revealedClues: Set<string>
  completedEvents: Set<string>
  playerActions: Array<{
    playerId: string
    type: string
    target?: string
    timestamp: Date
    result: any
  }>
}

// 游戏实例
export interface Game {
  id: string
  scriptId: string
  status: GameStatus
  players: Map<string, Player>
  progress: GameProgress
  settings: {
    allowLateJoin: boolean
    autoProgress: boolean
    timeMultiplier: number
  }
}

// 游戏服务
export class GameService {
  private games = ref<Map<string, Game>>(new Map())
  private activeGame = ref<string | null>(null)

  // 创建游戏
  createGame(scriptId: string, hostId: string): Game {
    const game: Game = {
      id: crypto.randomUUID(),
      scriptId,
      status: 'preparing',
      players: new Map([[hostId, {
        id: hostId,
        name: '',
        characterId: '',
        isHost: true,
        isReady: false,
        connection: {
          status: 'connected',
          lastSeen: new Date()
        }
      }]]),
      progress: {
        currentScene: '',
        elapsedTime: 0,
        revealedClues: new Set(),
        completedEvents: new Set(),
        playerActions: []
      },
      settings: {
        allowLateJoin: false,
        autoProgress: true,
        timeMultiplier: 1
      }
    }

    this.games.value.set(game.id, game)
    this.activeGame.value = game.id
    return game
  }

  // 加入游戏
  joinGame(gameId: string, playerId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'preparing' && !game.settings.allowLateJoin) {
      throw new Error('Game has already started')
    }

    if (game.players.has(playerId)) {
      throw new Error('Player already in game')
    }

    game.players.set(playerId, {
      id: playerId,
      name: '',
      characterId: '',
      isHost: false,
      isReady: false,
      connection: {
        status: 'connected',
        lastSeen: new Date()
      }
    })
  }

  // 离开游戏
  leaveGame(gameId: string, playerId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (!game.players.has(playerId)) {
      throw new Error('Player not in game')
    }

    game.players.delete(playerId)

    // 如果是房主离开，转移房主权限
    if (game.players.get(playerId)?.isHost) {
      const newHost = Array.from(game.players.values())[0]
      if (newHost) {
        newHost.isHost = true
      }
    }

    // 如果没有玩家了，删除游戏
    if (game.players.size === 0) {
      this.games.value.delete(gameId)
      if (this.activeGame.value === gameId) {
        this.activeGame.value = null
      }
    }
  }

  // 开始游戏
  startGame(gameId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'preparing') {
      throw new Error('Game has already started')
    }

    // 检查所有玩家是否准备
    for (const player of game.players.values()) {
      if (!player.isReady) {
        throw new Error('Not all players are ready')
      }
    }

    game.status = 'running'
  }

  // 暂停游戏
  pauseGame(gameId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'running') {
      throw new Error('Game is not running')
    }

    game.status = 'paused'
  }

  // 恢复游戏
  resumeGame(gameId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'paused') {
      throw new Error('Game is not paused')
    }

    game.status = 'running'
  }

  // 结束游戏
  endGame(gameId: string): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.status === 'finished') {
      throw new Error('Game has already finished')
    }

    game.status = 'finished'
  }

  // 更新玩家状态
  updatePlayerStatus(gameId: string, playerId: string, updates: Partial<Player>): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    const player = game.players.get(playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    Object.assign(player, updates)
  }

  // 记录玩家行动
  recordAction(gameId: string, playerId: string, type: string, target?: string, result?: any): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    game.progress.playerActions.push({
      playerId,
      type,
      target,
      timestamp: new Date(),
      result
    })
  }

  // 更新游戏进度
  updateProgress(gameId: string, updates: Partial<GameProgress>): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    Object.assign(game.progress, updates)
  }

  // 更新游戏设置
  updateSettings(gameId: string, updates: Partial<Game['settings']>): void {
    const game = this.games.value.get(gameId)
    if (!game) {
      throw new Error('Game not found')
    }

    Object.assign(game.settings, updates)
  }

  // 获取游戏
  getGame(id: string): Game | undefined {
    return this.games.value.get(id)
  }

  // 获取活动游戏
  getActiveGame(): Game | undefined {
    return this.activeGame.value ? this.games.value.get(this.activeGame.value) : undefined
  }

  // 获取所有游戏
  getAllGames(): Game[] {
    return Array.from(this.games.value.values())
  }
} 