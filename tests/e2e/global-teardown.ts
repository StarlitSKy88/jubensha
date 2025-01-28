import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  // 关闭测试服务器
  const server = (global as any).__TEST_SERVER__;
  if (server) {
    await server.close();
  }
  
  // 清理测试数据库
  execSync('docker-compose -f docker-compose.test.yml down -v');
  
  // 删除测试结果
  execSync('rm -rf test-results');
}

export default globalTeardown; 