import bcrypt from 'bcryptjs';
import { logger } from '@utils/logger';

export class PasswordService {
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      return bcrypt.hash(password, salt);
    } catch (error) {
      logger.error('密码加密失败:', error);
      throw error;
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('密码比对失败:', error);
      throw error;
    }
  }

  validatePasswordStrength(password: string): boolean {
    // 密码强度要求:
    // 1. 至少8个字符
    // 2. 包含至少一个大写字母
    // 3. 包含至少一个小写字母
    // 4. 包含至少一个数字
    // 5. 包含至少一个特殊字符
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
} 