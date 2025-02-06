import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, checkRole } from '../middlewares/auth.middleware';
import { validateRequest } from '@middlewares/validation.middleware';
import { 
  registerSchema, 
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateUserRoleSchema 
} from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

// 公开路由
router.post('/register', validateRequest(registerSchema), userController.register);
router.post('/login', validateRequest(loginSchema), userController.login);

// 需要认证的路由
router.get('/me', authenticateToken, userController.getCurrentUser);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), userController.updateProfile);
router.put('/password', authenticateToken, validateRequest(changePasswordSchema), userController.changePassword);

// 管理员路由
router.get('/users', authenticateToken, checkRole(['admin']), userController.getUsers);
router.put('/users/:userId/role', 
  authenticateToken, 
  checkRole(['admin']), 
  validateRequest(updateUserRoleSchema), 
  userController.updateUserRole
);

export default router; 