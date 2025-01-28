import { test, expect } from '@playwright/test';

test.describe('房间测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');
  });

  test('创建房间', async ({ page }) => {
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '测试房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    await expect(page.locator('text=测试房间')).toBeVisible();
  });

  test('加入房间', async ({ page }) => {
    // 创建一个房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '测试房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    
    // 等待房间创建完成
    await expect(page.locator('text=测试房间')).toBeVisible();
    
    // 加入房间
    await page.click('button:has-text("加入房间")');
    await expect(page.locator('text=语音房间')).toBeVisible();
  });

  test('房间列表刷新', async ({ page }) => {
    // 记录初始房间数量
    const initialRooms = await page.locator('.MuiCard-root').count();
    
    // 创建新房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '新房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    
    // 等待房间列表更新
    await page.waitForTimeout(1000);
    const updatedRooms = await page.locator('.MuiCard-root').count();
    expect(updatedRooms).toBeGreaterThan(initialRooms);
  });

  test('房间状态更新', async ({ page }) => {
    // 创建房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '状态测试房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    
    // 等待房间创建完成
    await expect(page.locator('text=状态测试房间')).toBeVisible();
    
    // 验证初始状态
    await expect(page.locator('text=waiting')).toBeVisible();
    
    // 加入房间
    await page.click('button:has-text("加入房间")');
    
    // 验证状态更新
    await expect(page.locator('text=playing')).toBeVisible();
  });

  test('房间人数限制', async ({ page }) => {
    // 创建一个满员房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '满员房间');
    await page.fill('input[name="maxPlayers"]', '1');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    
    // 等待房间创建完成
    await expect(page.locator('text=满员房间')).toBeVisible();
    
    // 验证加入按钮被禁用
    await expect(page.locator('button:has-text("加入房间")')).toBeDisabled();
  });

  test('房间搜索', async ({ page }) => {
    // 创建一个特殊名称的房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '特殊测试房间XYZ');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    
    // 等待房间创建完成
    await expect(page.locator('text=特殊测试房间XYZ')).toBeVisible();
    
    // 搜索房间
    await page.fill('input[placeholder="搜索房间"]', 'XYZ');
    
    // 验证搜索结果
    const rooms = await page.locator('.MuiCard-root').count();
    expect(rooms).toBe(1);
    await expect(page.locator('text=特殊测试房间XYZ')).toBeVisible();
  });
}); 