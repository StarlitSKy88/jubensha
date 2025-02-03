import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthError } from '../errors/auth.error';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dtos/auth.dto';

export class AuthController {
  /**
   * 用户注册
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: CreateUserDto = req.body;
      const result = await authService.register(userData);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginUserDto = req.body;
      const result = await authService.login(loginData);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AuthError('未经授权', 401);
      }
      const user = await authService.getUserProfile(req.user._id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新用户信息
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AuthError('未经授权', 401);
      }
      const updateData: UpdateUserDto = req.body;
      const user = await authService.updateProfile(req.user._id, updateData);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登出
   * 注意：由于使用JWT，服务器端实际上不需要做任何操作
   * 客户端只需要删除本地存储的token即可
   */
  async logout(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: '登出成功'
    });
  }
}

export const authController = new AuthController(); 