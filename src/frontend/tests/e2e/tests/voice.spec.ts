import { test, expect } from '@playwright/test';

test.describe('语音房间测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');

    // 创建并加入房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '语音测试房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    await expect(page.locator('text=语音测试房间')).toBeVisible();
    await page.click('button:has-text("加入房间")');
  });

  test('麦克风控制', async ({ page }) => {
    // 等待语音控制按钮加载
    await expect(page.locator('button[aria-label="麦克风"]')).toBeVisible();
    
    // 初始状态应该是关闭的
    await expect(page.locator('button[aria-label="麦克风"]')).toHaveAttribute('aria-pressed', 'false');
    
    // 打开麦克风
    await page.click('button[aria-label="麦克风"]');
    await expect(page.locator('button[aria-label="麦克风"]')).toHaveAttribute('aria-pressed', 'true');
    
    // 关闭麦克风
    await page.click('button[aria-label="麦克风"]');
    await expect(page.locator('button[aria-label="麦克风"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('音量控制', async ({ page }) => {
    // 等待音量控制按钮加载
    await expect(page.locator('button[aria-label="音量"]')).toBeVisible();
    
    // 初始状态应该是打开的
    await expect(page.locator('button[aria-label="音量"]')).toHaveAttribute('aria-pressed', 'true');
    
    // 关闭音量
    await page.click('button[aria-label="音量"]');
    await expect(page.locator('button[aria-label="音量"]')).toHaveAttribute('aria-pressed', 'false');
    
    // 打开音量
    await page.click('button[aria-label="音量"]');
    await expect(page.locator('button[aria-label="音量"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('参与者列表', async ({ page }) => {
    // 等待参与者列表加载
    await expect(page.locator('.MuiList-root')).toBeVisible();
    
    // 验证当前用户在列表中
    await expect(page.locator('text=testuser')).toBeVisible();
    
    // 验证参与者状态显示
    await expect(page.locator('text=speaking')).toBeVisible();
  });

  test('离开房间', async ({ page }) => {
    // 等待离开按钮加载
    await expect(page.locator('button:has-text("离开房间")')).toBeVisible();
    
    // 点击离开按钮
    await page.click('button:has-text("离开房间")');
    
    // 验证返回到大厅
    await page.waitForURL('/lobby');
    expect(page.url()).toContain('/lobby');
  });

  test('重新连接', async ({ page }) => {
    // 模拟断开连接
    await page.evaluate(() => {
      // 触发断开连接事件
      window.dispatchEvent(new Event('offline'));
    });
    
    // 等待重连提示显示
    await expect(page.locator('text=正在重新连接...')).toBeVisible();
    
    // 模拟恢复连接
    await page.evaluate(() => {
      // 触发恢复连接事件
      window.dispatchEvent(new Event('online'));
    });
    
    // 验证重连成功
    await expect(page.locator('text=连接成功')).toBeVisible();
  });
}); 