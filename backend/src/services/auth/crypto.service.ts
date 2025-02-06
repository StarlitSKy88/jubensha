import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthError } from '@errors/auth.error';

export class CryptoService {
  private readonly SALT_ROUNDS = 10;
  private readonly HASH_ALGORITHM = 'sha256';
  private readonly KEY_LENGTH = 32;
  private readonly ITERATION_COUNT = 100000;

  // 密码加密
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      throw new AuthError('Password encryption failed', 500);
    }
  }

  // 密码验证
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new AuthError('Password verification failed', 500);
    }
  }

  // 生成随机令牌
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // 生成密钥派生
  async deriveKey(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.ITERATION_COUNT,
        this.KEY_LENGTH,
        this.HASH_ALGORITHM,
        (err, derivedKey) => {
          if (err) reject(new AuthError('Key derivation failed', 500));
          resolve(derivedKey.toString('hex'));
        }
      );
    });
  }

  // 生成安全的随机盐值
  generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // 生成哈希
  createHash(data: string): string {
    return crypto
      .createHash(this.HASH_ALGORITHM)
      .update(data)
      .digest('hex');
  }

  // 生成HMAC
  createHmac(data: string, key: string): string {
    return crypto
      .createHmac(this.HASH_ALGORITHM, key)
      .update(data)
      .digest('hex');
  }

  // 生成安全的随机字符串
  generateSecureString(length: number = 32): string {
    const bytes = crypto.randomBytes(length);
    return bytes.toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
  }
} 