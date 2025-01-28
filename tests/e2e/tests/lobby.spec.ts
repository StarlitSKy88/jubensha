import { test, expect } from '@playwright/test';

test.describe('游戏大厅', () => {
  test.beforeEach(async ({ page }) => {
    // 登录测试用户
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('显示房间列表', async ({ page }) => {
    // 验证房间列表
    await expect(page.locator('.room-list')).toBeVisible();
    await expect(page.locator('.room-item')).toHaveCount(1);
    await expect(page.locator('.room-item').first()).toContainText('测试房间1');
  });

  test('创建房间', async ({ page }) => {
    // 点击创建房间按钮
    await page.click('button[aria-label="创建房间"]');
    
    // 填写房间信息
    await page.fill('input[name="roomName"]', '新房间');
    await page.selectOption('select[name="gameType"]', 'murder');
    await page.fill('input[name="maxPlayers"]', '8');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证房间创建成功
    await expect(page.locator('.room-item')).toHaveCount(2);
    await expect(page.locator('.room-item').last()).toContainText('新房间');
  });

  test('加入房间', async ({ page }) => {
    // 点击第一个房间
    await page.click('.room-item >> text=测试房间1');
    
    // 验证进入房间
    await expect(page).toHaveURL(/\/room\/test-session-1/);
    await expect(page.locator('.room-header')).toContainText('测试房间1');
  });

  test('房间状态更新', async ({ page }) => {
    // 等待房间状态更新
    await expect(page.locator('.room-item.status-waiting')).toBeVisible();
    
    // 模拟其他用户加入
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('room-update', {
        detail: {
          roomId: 'test-session-1',
          status: 'ready',
          playerCount: 3
        }
      }));
    });
    
    // 验证状态更新
    await expect(page.locator('.room-item.status-ready')).toBeVisible();
    await expect(page.locator('.player-count')).toContainText('3/8');
  });

  test('房间筛选', async ({ page }) => {
    // 选择游戏类型
    await page.selectOption('select[name="filterGameType"]', 'murder');
    
    // 验证筛选结果
    await expect(page.locator('.room-item')).toHaveCount(1);
    await expect(page.locator('.room-item')).toContainText('测试房间1');
    
    // 选择其他游戏类型
    await page.selectOption('select[name="filterGameType"]', 'party');
    
    // 验证无结果
    await expect(page.locator('.room-item')).toHaveCount(0);
    await expect(page.locator('.no-results')).toBeVisible();
  });

  test('房间搜索', async ({ page }) => {
    // 输入搜索关键词
    await page.fill('input[name="searchKeyword"]', '测试');
    
    // 验证搜索结果
    await expect(page.locator('.room-item')).toHaveCount(1);
    await expect(page.locator('.room-item')).toContainText('测试房间1');
    
    // 输入不存在的关键词
    await page.fill('input[name="searchKeyword"]', '不存在');
    
    // 验证无结果
    await expect(page.locator('.room-item')).toHaveCount(0);
    await expect(page.locator('.no-results')).toBeVisible();
  });
}); 