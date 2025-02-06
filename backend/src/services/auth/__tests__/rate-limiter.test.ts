import { RateLimiter } from '../rate-limiter.middleware';
import { AuthError } from '@errors/auth.error';
import { Request, Response, NextFunction } from 'express';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // 创建RateLimiter实例
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1秒
      max: 2 // 最多2个请求
    });

    // 模拟请求对象
    mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
      socket: {
        remoteAddress: '127.0.0.1'
      }
    };

    // 模拟响应对象
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // 模拟next函数
    nextFunction = jest.fn();
  });

  afterEach(async () => {
    // 清理Redis连接
    await rateLimiter.close();
  });

  describe('middleware', () => {
    it('应该允许在限制内的请求通过', async () => {
      const middleware = rateLimiter.middleware();
      
      // 第一个请求
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('应该阻止超出限制的请求', async () => {
      const middleware = rateLimiter.middleware();
      
      // 发送3个请求(超出限制)
      for (let i = 0; i < 3; i++) {
        await middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }
      
      // 验证第三个请求被阻止
      expect(nextFunction).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(429);
    });

    it('应该在时间窗口重置后允许新的请求', async () => {
      const middleware = rateLimiter.middleware();
      
      // 发送2个请求
      for (let i = 0; i < 2; i++) {
        await middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }
      
      // 等待时间窗口重置
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 发送新请求
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      expect(nextFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe('resetLimit', () => {
    it('应该成功重置特定IP的计数器', async () => {
      const middleware = rateLimiter.middleware();
      
      // 发送2个请求
      for (let i = 0; i < 2; i++) {
        await middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }
      
      // 重置限制
      await rateLimiter.resetLimit('127.0.0.1');
      
      // 发送新请求
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      expect(nextFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe('getRemainingRequests', () => {
    it('应该正确返回剩余请求次数', async () => {
      const middleware = rateLimiter.middleware();
      
      // 发送1个请求
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      
      // 检查剩余请求次数
      const remaining = await rateLimiter.getRemainingRequests('127.0.0.1');
      expect(remaining).toBe(1); // 最大2次,已用1次,剩余1次
    });
  });

  describe('错误处理', () => {
    it('应该在Redis连接失败时抛出错误', async () => {
      // 模拟Redis连接失败
      jest.spyOn(rateLimiter['redisClient'], 'incr').mockRejectedValue(new Error('Redis error'));
      
      const middleware = rateLimiter.middleware();
      
      await expect(
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow('Redis error');
    });
  });
}); 