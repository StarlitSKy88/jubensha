import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import { startTestServer } from './utils/test-server';

async function globalSetup(config: FullConfig) {
  // 启动测试数据库
  execSync('docker-compose -f docker-compose.test.yml up -d db');
  
  // 等待数据库就绪
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 运行数据库迁移
  execSync('alembic upgrade head');
  
  // 加载测试数据
  execSync('python tests/e2e/utils/load_test_data.py');
  
  // 启动测试服务器
  const server = await startTestServer();
  
  // 将服务器实例存储在全局变量中
  (global as any).__TEST_SERVER__ = server;
}

export default globalSetup; 