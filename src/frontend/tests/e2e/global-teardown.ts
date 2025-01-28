import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // 这里可以添加测试后的全局清理
  console.log('测试运行完成...');
}

export default globalTeardown; 