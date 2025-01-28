import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('用户注册', async ({ page }) => {
    await page.goto('/register');
    
    // 填写注册表单
    await page.fill('input[name="username"]', '新用户');
    await page.fill('input[name="email"]', 'new@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证注册成功并跳转
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.MuiAlert-message')).toContainText('注册成功');
  });

  test('用户登录', async ({ page }) => {
    await page.goto('/login');
    
    // 填写登录表单
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证登录成功并跳转
    await expect(page).toHaveURL('/');
    await expect(page.locator('.MuiAlert-message')).toContainText('登录成功');
  });

  test('登录失败', async ({ page }) => {
    await page.goto('/login');
    
    // 填写错误的登录信息
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrong_password');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 验证错误提示
    await expect(page.locator('.MuiAlert-message')).toContainText('用户名或密码错误');
    await expect(page).toHaveURL('/login');
  });

  test('退出登录', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    // 点击退出按钮
    await page.click('button[aria-label="退出登录"]');
    
    // 验证退出成功并跳转
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.MuiAlert-message')).toContainText('已退出登录');
  });

  test('访问受保护路由', async ({ page }) => {
    // 未登录时访问主页
    await page.goto('/');
    
    // 验证重定向到登录页
    await expect(page).toHaveURL('/login');
    
    // 登录后访问主页
    await page.fill('input[name="email"]', 'test1@example.com');
    await page.fill('input[name="password"]', 'test_hash_1');
    await page.click('button[type="submit"]');
    
    // 验证可以访问主页
    await expect(page).toHaveURL('/');
  });
}); 