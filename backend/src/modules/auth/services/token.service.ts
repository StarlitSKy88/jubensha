import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { Redis } from '@utils/redis';
import { logger } from '@utils/logger';
import { AuthenticationError } from '@utils/errors';

interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export class TokenService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    try {
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      // 将token存储到Redis，用于注销和刷新
      const key = `token:${payload.id}`;
      await this.redis.set(key, token, {
        EX: parseInt(config.jwt.expiresIn) // 设置过期时间
      });

      return token;
    } catch (error) {
      logger.error('生成token失败:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

      // 检查token是否在Redis中
      const key = `token:${decoded.id}`;
      const storedToken = await this.redis.get(key);

      if (!storedToken || storedToken !== token) {
        throw new AuthenticationError('Token已失效');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token已过期');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('无效的Token');
      }
      logger.error('验证token失败:', error);
      throw error;
    }
  }

  async removeToken(userId: string): Promise<void> {
    try {
      const key = `token:${userId}`;
      await this.redis.del(key);
    } catch (error) {
      logger.error('删除token失败:', error);
      throw error;
    }
  }

  async refreshToken(oldToken: string): Promise<string> {
    try {
      const decoded = await this.verifyToken(oldToken);
      return this.generateToken(decoded);
    } catch (error) {
      logger.error('刷新token失败:', error);
      throw error;
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `blacklist:${token}`;
      return !!(await this.redis.get(key));
    } catch (error) {
      logger.error('检查token黑名单失败:', error);
      throw error;
    }
  }

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    try {
      const key = `blacklist:${token}`;
      await this.redis.set(key, '1', {
        EX: expiresIn
      });
    } catch (error) {
      logger.error('添加token到黑名单失败:', error);
      throw error;
    }
  }
} 