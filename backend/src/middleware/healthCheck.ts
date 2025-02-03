import { Request, Response } from 'express';
import mongoose, { Connection } from 'mongoose';

export const healthCheck = async (req: Request, res: Response) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: {
      status: 'UP',
      latency: 0
    }
  };

  try {
    // 检查数据库连接
    const conn = mongoose.connection as Connection & { db: any };
    if (conn.readyState === 1 && conn.db) {
      const start = Date.now();
      // 执行一个简单的数据库操作来测试响应时间
      await conn.db.admin().ping();
      healthcheck.database.latency = Date.now() - start;
    } else {
      healthcheck.database.status = 'DOWN';
      healthcheck.message = 'Database connection is down';
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = 'ERROR';
    healthcheck.database.status = 'DOWN';
    res.status(503).json(healthcheck);
  }
};

// 数据库连接状态检查
export const checkDatabaseConnection = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const conn = mongoose.connection;
  return {
    isConnected: conn.readyState === 1,
    state: states[conn.readyState as keyof typeof states],
    details: {
      host: conn.host,
      port: conn.port,
      name: conn.name
    }
  };
};

// 系统资源使用情况
export const getSystemMetrics = () => {
  return {
    memory: {
      total: process.memoryUsage().heapTotal,
      used: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external
    },
    cpu: {
      user: process.cpuUsage().user,
      system: process.cpuUsage().system
    },
    uptime: process.uptime()
  };
}; 