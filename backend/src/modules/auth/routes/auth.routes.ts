import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { auth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

// 公开路由
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// 需要认证的路由
router.use(auth);
router.get('/me', authController.getCurrentUser.bind(authController));
router.put('/me', authController.updateProfile.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// 管理员路由
router.get('/users', checkRole(['admin']), async (req, res) => {
  // TODO: 实现用户列表接口
  res.status(200).json({ message: '获取用户列表' });
});

export const authRoutes = router; 