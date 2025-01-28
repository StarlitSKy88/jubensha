import { spawn, ChildProcess } from 'child_process';
import { AddressInfo } from 'net';
import * as http from 'http';

interface TestServer {
  process: ChildProcess;
  url: string;
  close: () => Promise<void>;
}

export async function startTestServer(): Promise<TestServer> {
  // 启动前端开发服务器
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: 'src/frontend',
    stdio: 'pipe',
    env: { ...process.env, PORT: '3000' }
  });

  // 启动后端服务器
  const backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--port', '8000'], {
    cwd: 'src/backend',
    stdio: 'pipe',
    env: { ...process.env, ENV: 'test' }
  });

  // 等待服务器就绪
  await Promise.all([
    waitForServer('http://localhost:3000'),
    waitForServer('http://localhost:8000')
  ]);

  return {
    process: frontendProcess,
    url: 'http://localhost:3000',
    close: async () => {
      frontendProcess.kill();
      backendProcess.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };
}

async function waitForServer(url: string): Promise<void> {
  while (true) {
    try {
      await fetch(url);
      break;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 监听进程错误
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
  process.exit(1);
}); 