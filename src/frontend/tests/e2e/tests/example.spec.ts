import { test, expect } from '@playwright/test';

test('基本测试', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForURL('/login', { timeout: 60000 });
  expect(page.url()).toContain('/login');
}); 
