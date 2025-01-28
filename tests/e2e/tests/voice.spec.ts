import { test, expect } from '@playwright/test';

test.describe('语音房间', () => {
  test.beforeEach(async ({ page }) => {
    // 登录测试用户
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    await page.click('button[type="submit"]');
    
    // 进入测试房间
    await page.goto('/room/test-session-1');
  });

  test('加入语音房间', async ({ page }) => {
    // 点击加入语音按钮
    await page.click('button[aria-label="加入语音"]');
    
    // 等待媒体权限请求
    await page.evaluate(() => {
      return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop());
            resolve(true);
          })
          .catch(() => resolve(false));
      });
    });
    
    // 验证加入成功
    await expect(page.locator('.voice-status')).toContainText('已连接');
    await expect(page.locator('.participant-list')).toBeVisible();
  });

  test('参与者列表更新', async ({ page }) => {
    // 加入语音
    await page.click('button[aria-label="加入语音"]');
    
    // 验证初始参与者列表
    await expect(page.locator('.participant-item')).toHaveCount(1);
    await expect(page.locator('.participant-item').first()).toContainText('测试用户1');
    
    // 模拟其他用户加入
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('voice-update', {
        detail: {
          type: 'participant-join',
          participant: {
            id: 'test-user-2',
            username: '测试用户2',
            isSpeaking: false,
            isMuted: false
          }
        }
      }));
    });
    
    // 验证参与者列表更新
    await expect(page.locator('.participant-item')).toHaveCount(2);
    await expect(page.locator('.participant-item').last()).toContainText('测试用户2');
  });

  test('音频控制', async ({ page }) => {
    // 加入语音
    await page.click('button[aria-label="加入语音"]');
    
    // 测试麦克风控制
    await page.click('button[aria-label="麦克风"]');
    await expect(page.locator('.mic-status')).toContainText('已静音');
    
    await page.click('button[aria-label="麦克风"]');
    await expect(page.locator('.mic-status')).toContainText('已开启');
    
    // 测试音量控制
    await page.click('button[aria-label="音量"]');
    await expect(page.locator('.volume-slider')).toBeVisible();
    
    await page.fill('input[type="range"]', '50');
    await expect(page.locator('.volume-value')).toContainText('50%');
  });

  test('说话状态指示', async ({ page }) => {
    // 加入语音
    await page.click('button[aria-label="加入语音"]');
    
    // 模拟说话状态
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('voice-update', {
        detail: {
          type: 'speaking-change',
          participantId: 'test-user-1',
          isSpeaking: true
        }
      }));
    });
    
    // 验证说话状态指示
    await expect(page.locator('.participant-item.speaking')).toBeVisible();
    await expect(page.locator('.speaking-indicator')).toBeVisible();
  });

  test('连接状态处理', async ({ page }) => {
    // 加入语音
    await page.click('button[aria-label="加入语音"]');
    
    // 模拟连接断开
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('voice-update', {
        detail: {
          type: 'connection-state',
          state: 'disconnected'
        }
      }));
    });
    
    // 验证重连提示
    await expect(page.locator('.connection-status')).toContainText('已断开');
    await expect(page.locator('.reconnect-button')).toBeVisible();
    
    // 点击重连
    await page.click('.reconnect-button');
    
    // 验证重连成功
    await expect(page.locator('.connection-status')).toContainText('已连接');
  });

  test('离开语音房间', async ({ page }) => {
    // 加入语音
    await page.click('button[aria-label="加入语音"]');
    
    // 点击离开按钮
    await page.click('button[aria-label="离开语音"]');
    
    // 验证离开成功
    await expect(page.locator('.voice-status')).toContainText('未连接');
    await expect(page.locator('.participant-list')).not.toBeVisible();
  });
}); 