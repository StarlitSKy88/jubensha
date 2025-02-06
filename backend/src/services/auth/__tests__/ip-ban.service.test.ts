import { IpBanService } from '../ip-ban.service';

describe('IpBanService', () => {
  let ipBanService: IpBanService;

  beforeEach(() => {
    ipBanService = new IpBanService();
  });

  afterEach(async () => {
    await ipBanService.close();
  });

  describe('isBanned', () => {
    it('应该返回未被封禁的IP状态', async () => {
      const ip = '192.168.1.1';
      const isBanned = await ipBanService.isBanned(ip);
      expect(isBanned).toBe(false);
    });

    it('应该返回被封禁的IP状态', async () => {
      const ip = '192.168.1.2';
      await ipBanService.banIp(ip, '测试封禁');
      const isBanned = await ipBanService.isBanned(ip);
      expect(isBanned).toBe(true);
    });

    it('应该在封禁过期后返回false', async () => {
      const ip = '192.168.1.3';
      await ipBanService.banIp(ip, '测试封禁', 100); // 100ms封禁时间
      await new Promise(resolve => setTimeout(resolve, 150));
      const isBanned = await ipBanService.isBanned(ip);
      expect(isBanned).toBe(false);
    });
  });

  describe('recordFailedAttempt', () => {
    it('应该记录失败尝试', async () => {
      const ip = '192.168.1.4';
      await ipBanService.recordFailedAttempt(ip, '登录失败');
      const attempts = await ipBanService.getFailedAttempts(ip);
      expect(attempts).toBe(1);
    });

    it('应该在达到最大尝试次数时自动封禁IP', async () => {
      const ip = '192.168.1.5';
      
      // 记录多次失败尝试
      for (let i = 0; i < 5; i++) {
        await ipBanService.recordFailedAttempt(ip, '登录失败');
      }

      const isBanned = await ipBanService.isBanned(ip);
      expect(isBanned).toBe(true);
    });
  });

  describe('banIp', () => {
    it('应该成功封禁IP', async () => {
      const ip = '192.168.1.6';
      await ipBanService.banIp(ip, '测试封禁');
      const record = await ipBanService.getBanRecord(ip);
      
      expect(record).toBeDefined();
      expect(record?.ip).toBe(ip);
      expect(record?.reason).toBe('测试封禁');
      expect(record?.bannedAt).toBeDefined();
      expect(record?.expiresAt).toBeDefined();
    });

    it('应该使用自定义封禁时间', async () => {
      const ip = '192.168.1.7';
      const duration = 5000; // 5秒
      await ipBanService.banIp(ip, '测试封禁', duration);
      const record = await ipBanService.getBanRecord(ip);
      
      expect(record).toBeDefined();
      expect(record?.expiresAt - record!.bannedAt).toBe(duration);
    });
  });

  describe('unbanIp', () => {
    it('应该成功解除IP封禁', async () => {
      const ip = '192.168.1.8';
      await ipBanService.banIp(ip, '测试封禁');
      await ipBanService.unbanIp(ip);
      
      const isBanned = await ipBanService.isBanned(ip);
      expect(isBanned).toBe(false);
    });
  });

  describe('getRemainingBanTime', () => {
    it('应该返回剩余封禁时间', async () => {
      const ip = '192.168.1.9';
      const duration = 5000; // 5秒
      await ipBanService.banIp(ip, '测试封禁', duration);
      
      const remainingTime = await ipBanService.getRemainingBanTime(ip);
      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(duration);
    });

    it('应该对未封禁的IP返回0', async () => {
      const ip = '192.168.1.10';
      const remainingTime = await ipBanService.getRemainingBanTime(ip);
      expect(remainingTime).toBe(0);
    });
  });

  describe('resetAttempts', () => {
    it('应该重置失败尝试次数', async () => {
      const ip = '192.168.1.11';
      
      // 记录失败尝试
      await ipBanService.recordFailedAttempt(ip, '登录失败');
      await ipBanService.recordFailedAttempt(ip, '登录失败');
      
      // 重置尝试次数
      await ipBanService.resetAttempts(ip);
      
      const attempts = await ipBanService.getFailedAttempts(ip);
      expect(attempts).toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理Redis连接错误', async () => {
      // 模拟Redis连接错误
      jest.spyOn(ipBanService['redisClient'], 'get').mockRejectedValue(new Error('Redis error'));
      
      await expect(ipBanService.isBanned('192.168.1.12')).rejects.toThrow('Redis error');
    });
  });
}); 