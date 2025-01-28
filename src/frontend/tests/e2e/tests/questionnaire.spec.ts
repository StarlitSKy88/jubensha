import { test, expect } from '@playwright/test';

test.describe('问卷测试', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');
  });

  test('问卷基本信息验证', async ({ page }) => {
    await page.goto('/questionnaire');
    await expect(page.locator('h4')).toHaveText('玩家偏好问卷');
    await expect(page.locator('.MuiStepper-root')).toBeVisible();
  });

  test('表单验证', async ({ page }) => {
    await page.goto('/questionnaire');
    await page.click('button:has-text("下一步")');
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('多步导航', async ({ page }) => {
    await page.goto('/questionnaire');
    
    // 第一步
    await page.click('input[type="radio"]');
    await page.click('button:has-text("下一步")');
    
    // 第二步
    await page.click('input[type="radio"]');
    await page.click('button:has-text("上一步")');
    
    // 验证数据保留
    await expect(page.locator('input[type="radio"]:checked')).toBeVisible();
  });

  test('问卷提交', async ({ page }) => {
    await page.goto('/questionnaire');
    
    // 填写所有步骤
    for (let i = 0; i < 3; i++) {
      await page.click('input[type="radio"]');
      await page.click('button:has-text("下一步")');
    }
    
    // 最后一步
    await page.click('input[type="radio"]');
    await page.click('button:has-text("提交")');
    
    // 验证提交成功
    await expect(page.locator('text=分析结果')).toBeVisible();
  });

  test('分析结果验证', async ({ page }) => {
    await page.goto('/questionnaire');
    
    // 快速填写并提交
    for (let i = 0; i < 4; i++) {
      await page.click('input[type="radio"]');
      if (i < 3) {
        await page.click('button:has-text("下一步")');
      } else {
        await page.click('button:has-text("提交")');
      }
    }
    
    // 验证分析结果
    await expect(page.locator('h4:has-text("分析结果")')).toBeVisible();
    await expect(page.locator('h5:has-text("建议")')).toBeVisible();
    const recommendations = await page.locator('li').count();
    expect(recommendations).toBeGreaterThan(0);
  });

  test('草稿保存', async ({ page }) => {
    await page.goto('/questionnaire');
    
    // 填写部分问题
    await page.click('input[type="radio"]');
    await page.click('button:has-text("下一步")');
    await page.click('input[type="radio"]');
    
    // 刷新页面
    await page.reload();
    
    // 验证数据保留
    await expect(page.locator('input[type="radio"]:checked')).toBeVisible();
  });
}); 
