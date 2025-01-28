import { test, expect } from '@playwright/test';

test.describe('认证测试', () => {
  test('登录成功', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');
    expect(page.url()).toContain('/lobby');
  });

  test('登录失败 - 错误的凭证', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('注册成功', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/lobby');
    expect(page.url()).toContain('/lobby');
  });

  test('注册失败 - 密码不匹配', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password456');
    await page.click('button[type="submit"]');
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('注册失败 - 用户名已存在', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'another@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.MuiAlert-root')).toBeVisible();
  });

  test('登录页面导航到注册页面', async ({ page }) => {
    await page.goto('/login');
    await page.click('a:has-text("注册账号")');
    await page.waitForURL('/register');
    expect(page.url()).toContain('/register');
  });

  test('注册页面导航到登录页面', async ({ page }) => {
    await page.goto('/register');
    await page.click('a:has-text("登录")');
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });
}); 