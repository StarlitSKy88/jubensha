import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate, authorize } from '../middlewares/auth'

const router = Router()
const authController = new AuthController()

// 注册
router.post('/register', authController.register)

// 登录
router.post('/login', authController.login)

// 重置密码（需要认证和管理员权限）
router.post(
  '/reset-password/:userId',
  authenticate,
  authorize(['admin']),
  authController.resetPassword
)

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, authController.getCurrentUser)

export default router 