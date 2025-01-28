import { test, expect } from '@playwright/test';

test.describe('问卷表单', () => {
  test.beforeEach(async ({ page }) => {
    // 登录测试用户
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    await page.click('button[type="submit"]');
    
    // 进入问卷页面
    await page.goto('/questionnaire');
  });

  test('问卷基本信息', async ({ page }) => {
    // 验证问卷标题
    await expect(page.locator('.questionnaire-title')).toContainText('玩家偏好问卷');
    
    // 验证问卷说明
    await expect(page.locator('.questionnaire-description')).toContainText('帮助我们了解您的游戏偏好');
    
    // 验证进度指示器
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.progress-step.active')).toContainText('基本信息');
  });

  test('问卷表单验证', async ({ page }) => {
    // 尝试跳过必填项
    await page.click('button[aria-label="下一步"]');
    
    // 验证错误提示
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('请填写必填项');
    
    // 填写必填项
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="experience"]', 'intermediate');
    
    // 验证可以继续
    await page.click('button[aria-label="下一步"]');
    await expect(page.locator('.progress-step.active')).toContainText('游戏偏好');
  });

  test('多步骤导航', async ({ page }) => {
    // 填写第一步
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="experience"]', 'intermediate');
    await page.click('button[aria-label="下一步"]');
    
    // 验证第二步
    await expect(page.locator('.progress-step.active')).toContainText('游戏偏好');
    
    // 返回上一步
    await page.click('button[aria-label="上一步"]');
    await expect(page.locator('.progress-step.active')).toContainText('基本信息');
    
    // 验证数据保留
    await expect(page.locator('input[name="age"]')).toHaveValue('25');
    await expect(page.locator('select[name="experience"]')).toHaveValue('intermediate');
  });

  test('问卷提交', async ({ page }) => {
    // 填写所有步骤
    // 第一步：基本信息
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="experience"]', 'intermediate');
    await page.click('button[aria-label="下一步"]');
    
    // 第二步：游戏偏好
    await page.click('input[name="preferredRole"][value="detective"]');
    await page.selectOption('select[name="preferredGenre"]', 'mystery');
    await page.click('button[aria-label="下一步"]');
    
    // 第三步：性格测试
    await page.fill('textarea[name="selfDescription"]', '我是一个喜欢推理的人');
    await page.click('input[name="personality"][value="analytical"]');
    
    // 提交问卷
    await page.click('button[type="submit"]');
    
    // 验证提交成功
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('问卷提交成功');
  });

  test('问卷分析结果', async ({ page }) => {
    // 完成并提交问卷
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="experience"]', 'intermediate');
    await page.click('button[aria-label="下一步"]');
    
    await page.click('input[name="preferredRole"][value="detective"]');
    await page.selectOption('select[name="preferredGenre"]', 'mystery');
    await page.click('button[aria-label="下一步"]');
    
    await page.fill('textarea[name="selfDescription"]', '我是一个喜欢推理的人');
    await page.click('input[name="personality"][value="analytical"]');
    await page.click('button[type="submit"]');
    
    // 等待分析结果
    await expect(page.locator('.analysis-result')).toBeVisible();
    
    // 验证结果内容
    await expect(page.locator('.personality-type')).toContainText('分析型');
    await expect(page.locator('.role-suggestion')).toContainText('侦探');
    await expect(page.locator('.game-recommendation')).toBeVisible();
  });

  test('保存草稿', async ({ page }) => {
    // 填写部分内容
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="experience"]', 'intermediate');
    
    // 保存草稿
    await page.click('button[aria-label="保存草稿"]');
    
    // 验证保存成功
    await expect(page.locator('.save-message')).toContainText('草稿已保存');
    
    // 刷新页面
    await page.reload();
    
    // 验证数据恢复
    await expect(page.locator('input[name="age"]')).toHaveValue('25');
    await expect(page.locator('select[name="experience"]')).toHaveValue('intermediate');
  });
}); 