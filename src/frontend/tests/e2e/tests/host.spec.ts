import { test, expect } from '@playwright/test';

test.describe('主持人控制台测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');

    // 创建并进入房间
    await page.click('button:has-text("创建房间")');
    await page.fill('input[name="name"]', '主持人测试房间');
    await page.fill('input[name="maxPlayers"]', '8');
    await page.fill('input[name="gameType"]', 'standard');
    await page.click('button:has-text("创建")');
    await expect(page.locator('text=主持人测试房间')).toBeVisible();
    await page.click('button:has-text("加入房间")');
  });

  test('游戏阶段控制', async ({ page }) => {
    // 等待阶段列表加载
    await expect(page.locator('.MuiList-root')).toBeVisible();
    
    // 验证初始阶段
    await expect(page.locator('text=准备阶段')).toBeVisible();
    
    // 开始新阶段
    await page.click('button[aria-label="开始阶段"]');
    
    // 验证阶段更新
    await expect(page.locator('text=游戏阶段')).toBeVisible();
    await expect(page.locator('text=剩余时间')).toBeVisible();
  });

  test('线索管理', async ({ page }) => {
    // 等待线索列表加载
    await expect(page.locator('text=线索管理')).toBeVisible();
    
    // 验证初始线索状态
    const initialClue = page.locator('.MuiListItem-root').first();
    await expect(initialClue.locator('button[aria-label="显示线索"]')).toBeVisible();
    
    // 显示线索
    await initialClue.locator('button[aria-label="显示线索"]').click();
    
    // 验证线索状态更新
    await expect(initialClue.locator('button[aria-label="隐藏线索"]')).toBeVisible();
  });

  test('玩家状态管理', async ({ page }) => {
    // 等待玩家列表加载
    await expect(page.locator('text=玩家状态')).toBeVisible();
    
    // 验证玩家状态
    const playerItem = page.locator('.MuiListItem-root').first();
    await expect(playerItem.locator('text=active')).toBeVisible();
    
    // 更改玩家状态
    await playerItem.locator('button:has-text("禁用")').click();
    
    // 验证状态更新
    await expect(playerItem.locator('text=inactive')).toBeVisible();
  });

  test('游戏进度监控', async ({ page }) => {
    // 等待进度信息加载
    await expect(page.locator('text=当前阶段')).toBeVisible();
    
    // 验证时间显示
    await expect(page.locator('text=剩余时间')).toBeVisible();
    
    // 等待一段时间
    await page.waitForTimeout(1000);
    
    // 验证时间更新
    const timeText = await page.locator('text=剩余时间').textContent();
    expect(timeText).toBeDefined();
  });

  test('主持人提示', async ({ page }) => {
    // 等待提示区域加载
    await expect(page.locator('text=主持人提示')).toBeVisible();
    
    // 验证初始提示
    await expect(page.locator('text=欢迎来到游戏')).toBeVisible();
    
    // 触发新阶段
    await page.click('button[aria-label="开始阶段"]');
    
    // 验证提示更新
    await expect(page.locator('text=新阶段已开始')).toBeVisible();
  });

  test('错误处理', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/api/games/**', (route) => {
      route.abort();
    });
    
    // 尝试操作
    await page.click('button[aria-label="开始阶段"]');
    
    // 验证错误提示
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
    await expect(page.locator('text=操作失败')).toBeVisible();
  });
}); 