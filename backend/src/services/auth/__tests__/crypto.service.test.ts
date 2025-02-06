import { CryptoService } from '../crypto.service';
import { AuthError } from '@errors/auth.error';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  describe('hashPassword', () => {
    it('应该成功加密密码', async () => {
      const password = 'testPassword123';
      const hash = await cryptoService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('应该为不同的密码生成不同的哈希', async () => {
      const password1 = 'testPassword123';
      const password2 = 'testPassword456';
      
      const hash1 = await cryptoService.hashPassword(password1);
      const hash2 = await cryptoService.hashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('应该正确验证密码', async () => {
      const password = 'testPassword123';
      const hash = await cryptoService.hashPassword(password);
      
      const isValid = await cryptoService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hash = await cryptoService.hashPassword(password);
      
      const isValid = await cryptoService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('应该生成指定长度的令牌', () => {
      const length = 32;
      const token = cryptoService.generateToken(length);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(length * 2); // 因为是十六进制字符串
    });

    it('不同调用应该生成不同的令牌', () => {
      const token1 = cryptoService.generateToken();
      const token2 = cryptoService.generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('deriveKey', () => {
    it('应该从密码和盐值派生密钥', async () => {
      const password = 'testPassword123';
      const salt = cryptoService.generateSalt();
      
      const key = await cryptoService.deriveKey(password, salt);
      
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('相同的密码和盐值应该生成相同的密钥', async () => {
      const password = 'testPassword123';
      const salt = cryptoService.generateSalt();
      
      const key1 = await cryptoService.deriveKey(password, salt);
      const key2 = await cryptoService.deriveKey(password, salt);
      
      expect(key1).toBe(key2);
    });
  });

  describe('generateSalt', () => {
    it('应该生成指定长度的盐值', () => {
      const length = 16;
      const salt = cryptoService.generateSalt(length);
      
      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBe(length * 2); // 因为是十六进制字符串
    });

    it('不同调用应该生成不同的盐值', () => {
      const salt1 = cryptoService.generateSalt();
      const salt2 = cryptoService.generateSalt();
      
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('createHash', () => {
    it('应该为数据创建哈希', () => {
      const data = 'test data';
      const hash = cryptoService.createHash(data);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('相同的数据应该生成相同的哈希', () => {
      const data = 'test data';
      
      const hash1 = cryptoService.createHash(data);
      const hash2 = cryptoService.createHash(data);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('createHmac', () => {
    it('应该使用密钥创建HMAC', () => {
      const data = 'test data';
      const key = 'test key';
      const hmac = cryptoService.createHmac(data, key);
      
      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe('string');
      expect(hmac.length).toBeGreaterThan(0);
    });

    it('相同的数据和密钥应该生成相同的HMAC', () => {
      const data = 'test data';
      const key = 'test key';
      
      const hmac1 = cryptoService.createHmac(data, key);
      const hmac2 = cryptoService.createHmac(data, key);
      
      expect(hmac1).toBe(hmac2);
    });
  });

  describe('generateSecureString', () => {
    it('应该生成指定长度的安全字符串', () => {
      const length = 32;
      const str = cryptoService.generateSecureString(length);
      
      expect(str).toBeDefined();
      expect(typeof str).toBe('string');
      expect(str.length).toBe(length);
      expect(str).toMatch(/^[a-zA-Z0-9]+$/); // 只包含字母和数字
    });

    it('不同调用应该生成不同的字符串', () => {
      const str1 = cryptoService.generateSecureString();
      const str2 = cryptoService.generateSecureString();
      
      expect(str1).not.toBe(str2);
    });
  });
}); 