import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.js';
import { getDb, initSchema, closeDb } from './db/index.js';
import healthRoutes from './routes/health.js';
import newsRoutes from './routes/news.js';
import categoryRoutes from './routes/categories.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import { startScheduler, stopScheduler } from './modules/crawler/scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

// 关闭钩子
function gracefulShutdown(signal) {
  fastify.log.info({ signal }, 'Received signal, shutting down');
  stopScheduler();
  closeDb();
  fastify.close().then(() => {
    process.exit(0);
  });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function start() {
  // 注册插件
  await fastify.register(cors, {
    origin: true,
  });

  // 托管前端静态文件
  const clientDir = path.join(__dirname, '..', 'client');
  await fastify.register(fastifyStatic, {
    root: clientDir,
    prefix: '/',
    wildcard: false,
  });

  // 初始化数据库（sql.js 是异步的）
  const db = await getDb(config.db.path);
  initSchema(db);
  fastify.log.info({ path: config.db.path }, 'SQLite initialized');

  // 注册路由
  await fastify.register(healthRoutes);
  await fastify.register(newsRoutes);
  await fastify.register(categoryRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(chatRoutes);

  // 定时爬取调度器 (Tavily 已禁用)
  // startScheduler();

  // 启动服务器
  try {
    await fastify.listen({ port: config.port, host: config.host });
    fastify.log.info(`Server running at http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
