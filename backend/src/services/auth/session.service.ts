import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { UserModel } from '@models/auth';
import { AuthError } from '@errors/auth.error';
import { logger } from '@utils/logger';

interface TokenPayload {
  userId: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

interface SessionData {
  userId: string;
  deviceInfo: {
    ip: string;
    userAgent: string;
  };
  issuedAt: number;
  expiresAt: number;
}

export class SessionService {
  private redisClient;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD
    });

    this.redisClient.on('error', (err) => {
      logger.error('Redis连接错误:', err);
    });

    this.redisClient.connect().catch((err) => {
      logger.error('Redis连接失败:', err);
    });
  }

  // 创建新会话
  async createSession(userId: string, deviceInfo: { ip: string; userAgent: string }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // 验证用户是否存在
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AuthError('User not found', 404);
      }

      // 生成会话ID
      const sessionId = this.generateSessionId();

      // 创建会话数据
      const sessionData: SessionData = {
        userId,
        deviceInfo,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24小时
      };

      // 存储会话数据到Redis
      await this.redisClient.set(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        { EX: 24 * 60 * 60 } // 24小时过期
      );

      // 生成令牌
      const accessToken = this.generateToken({
        userId,
        sessionId,
        type: 'access'
      }, '1h');

      const refreshToken = this.generateToken({
        userId,
        sessionId,
        type: 'refresh'
      }, '7d');

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('创建会话失败:', error);
      throw error;
    }
  }

  // 验证会话
  async validateSession(token: string): Promise<{
    userId: string;
    sessionId: string;
  }> {
    try {
      // 验证令牌
      const payload = this.verifyToken(token) as TokenPayload;
      if (payload.type !== 'access') {
        throw new AuthError('Invalid token type', 401);
      }

      // 检查会话是否存在
      const sessionData = await this.getSessionData(payload.sessionId);
      if (!sessionData) {
        throw new AuthError('Session not found', 401);
      }

      // 检查会话是否过期
      if (sessionData.expiresAt < Date.now()) {
        await this.removeSession(payload.sessionId);
        throw new AuthError('Session expired', 401);
      }

      return {
        userId: payload.userId,
        sessionId: payload.sessionId
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid token', 401);
      }
      throw error;
    }
  }

  // 刷新会话
  async refreshSession(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // 验证刷新令牌
      const payload = this.verifyToken(refreshToken) as TokenPayload;
      if (payload.type !== 'refresh') {
        throw new AuthError('Invalid token type', 401);
      }

      // 获取会话数据
      const sessionData = await this.getSessionData(payload.sessionId);
      if (!sessionData) {
        throw new AuthError('Session not found', 401);
      }

      // 生成新的令牌
      const newAccessToken = this.generateToken({
        userId: payload.userId,
        sessionId: payload.sessionId,
        type: 'access'
      }, '1h');

      const newRefreshToken = this.generateToken({
        userId: payload.userId,
        sessionId: payload.sessionId,
        type: 'refresh'
      }, '7d');

      // 更新会话过期时间
      await this.extendSession(payload.sessionId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  // 移除会话
  async removeSession(sessionId: string): Promise<void> {
    await this.redisClient.del(`session:${sessionId}`);
  }

  // 获取用户所有会话
  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessions: SessionData[] = [];
    const pattern = `session:*`;
    
    // 获取所有会话键
    const keys = await this.redisClient.keys(pattern);
    
    // 获取每个会话的数据
    for (const key of keys) {
      const data = await this.redisClient.get(key);
      if (data) {
        const sessionData = JSON.parse(data) as SessionData;
        if (sessionData.userId === userId) {
          sessions.push(sessionData);
        }
      }
    }

    return sessions;
  }

  // 私有方法：生成会话ID
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 私有方法：生成JWT令牌
  private generateToken(payload: TokenPayload, expiresIn: string): string {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn }
    );
  }

  // 私有方法：验证JWT令牌
  private verifyToken(token: string): jwt.JwtPayload {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as jwt.JwtPayload;
  }

  // 私有方法：获取会话数据
  private async getSessionData(sessionId: string): Promise<SessionData | null> {
    const data = await this.redisClient.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  // 私有方法：延长会话时间
  private async extendSession(sessionId: string): Promise<void> {
    const data = await this.getSessionData(sessionId);
    if (data) {
      data.expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 延长24小时
      await this.redisClient.set(
        `session:${sessionId}`,
        JSON.stringify(data),
        { EX: 24 * 60 * 60 }
      );
    }
  }
} 