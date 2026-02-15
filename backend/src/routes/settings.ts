import { Router } from 'express';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

// 配置数据库文件上传
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const dbUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `temp-db-${uniqueSuffix}.db`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // 允许 .db 和 .sqlite 文件
    if (file.originalname.endsWith('.db') || file.originalname.endsWith('.sqlite')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传数据库文件 (.db 或 .sqlite)'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制 50MB
  }
});

// 获取所有配置（公开接口）
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    res.json(settings);
  } catch (error) {
    console.error('获取配置错误:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 导出数据库（需要管理员权限）- 必须在 /:key 之前定义
router.get('/export-database', authMiddleware, adminOnly, (req: any, res) => {
  try {
    const dbPath = path.join(__dirname, '../../database.sqlite');
    
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: '数据库文件不存在' });
    }

    res.download(dbPath, `family-manager-backup-${new Date().toISOString().split('T')[0]}.db`, (err) => {
      if (err) {
        console.error('下载数据库文件失败:', err);
        res.status(500).json({ error: '下载数据库文件失败' });
      }
    });
  } catch (error) {
    console.error('导出数据库错误:', error);
    res.status(500).json({ error: '导出数据库失败' });
  }
});

// 获取单个配置（公开接口）
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    
    if (!setting) {
      return res.status(404).json({ error: '配置不存在' });
    }

    res.json({ key, value: setting.value });
  } catch (error) {
    console.error('获取配置错误:', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 更新配置（需要管理员权限）
router.put('/:key', authMiddleware, adminOnly, (req: any, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const result = db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?').run(value, key);

    if (result.changes === 0) {
      // 如果不存在则创建
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }

    res.json({ message: '配置更新成功', key, value });
  } catch (error) {
    console.error('更新配置错误:', error);
    res.status(500).json({ error: '更新配置失败' });
  }
});

// 批量更新配置（需要管理员权限）
router.post('/batch', authMiddleware, adminOnly, (req: any, res) => {
  try {
    const settings = req.body;
    
    const updateStmt = db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?');
    const insertStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

    Object.entries(settings).forEach(([key, value]) => {
      const result = updateStmt.run(value, key);
      if (result.changes === 0) {
        insertStmt.run(key, value);
      }
    });

    res.json({ message: '配置批量更新成功' });
  } catch (error) {
    console.error('批量更新配置错误:', error);
    res.status(500).json({ error: '批量更新配置失败' });
  }
});

// 导入数据库（需要管理员权限）
router.post('/import-database', authMiddleware, adminOnly, dbUpload.single('database'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传数据库文件' });
    }

    const uploadedFilePath = req.file.path;
    const dbPath = path.join(__dirname, '../../database.sqlite');
    const backupPath = path.join(__dirname, `../../database.backup.${Date.now()}.sqlite`);

    // 备份当前数据库
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    }

    // 关闭当前数据库连接
    db.close();

    // 替换数据库文件
    fs.copyFileSync(uploadedFilePath, dbPath);

    // 删除上传的临时文件
    fs.unlinkSync(uploadedFilePath);

    res.json({ message: '数据库导入成功，请重启服务器以应用更改' });
  } catch (error) {
    console.error('导入数据库错误:', error);
    res.status(500).json({ error: '导入数据库失败' });
  }
});

// 重置数据库（需要管理员权限）
router.post('/reset-database', authMiddleware, adminOnly, (req: any, res) => {
  try {
    // 清空所有数据表，但保留用户和设置
    const tables = ['items', 'drawers', 'locations', 'item_categories'];
    
    tables.forEach(table => {
      db.prepare(`DELETE FROM ${table}`).run();
    });

    res.json({ message: '数据库已重置' });
  } catch (error) {
    console.error('重置数据库错误:', error);
    res.status(500).json({ error: '重置数据库失败' });
  }
});

export default router;
