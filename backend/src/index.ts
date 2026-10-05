import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase, seedDefaultCategories } from './database';

// 导入路由
import usersRouter from './routes/users';
import locationsRouter from './routes/locations';
import categoriesRouter from './routes/categories';
import drawersRouter from './routes/drawers';
import itemsRouter from './routes/items';
import settingsRouter from './routes/settings';
import uploadRouter from './routes/upload';

// 加载环境变量
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

// 中间件
app.use(cors());
// 图片以 Base64 存储在 JSON 中，放宽请求体大小限制（5MB 图片 Base64 后约 7MB）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务 - 用于访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 生产环境：serve 前端静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  // 所有非 API 路由都返回 index.html（用于 Vue Router）
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// 初始化数据库
initDatabase();
// 初始化内置类目
seedDefaultCategories();

// 路由
app.use('/api/users', usersRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/drawers', drawersRouter);
app.use('/api/items', itemsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`🌐 外部访问: http://0.0.0.0:${PORT}`);
  console.log(`📚 API 文档: http://localhost:${PORT}/api`);
});

export default app;
