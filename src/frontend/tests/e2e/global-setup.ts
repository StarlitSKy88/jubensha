import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // 这里可以添加测试前的全局设置
  console.log('开始运行测试...');
}

export default globalSetup; 