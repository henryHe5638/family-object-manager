import { Router } from 'express';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

// 获取所有地点
router.get('/', (req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations ORDER BY created_at DESC').all();
    res.json(locations);
  } catch (error) {
    console.error('获取地点列表错误:', error);
    res.status(500).json({ error: '获取地点列表失败' });
  }
});

// 获取单个地点
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
    
    if (!location) {
      return res.status(404).json({ error: '地点不存在' });
    }

    res.json(location);
  } catch (error) {
    console.error('获取地点错误:', error);
    res.status(500).json({ error: '获取地点失败' });
  }
});

// 创建地点
router.post('/', (req: any, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '地点名称不能为空' });
    }

    const result = db.prepare('INSERT INTO locations (name, description, created_by) VALUES (?, ?, ?)').run(name, description, req.userId);

    res.status(201).json({
      message: '地点创建成功',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('创建地点错误:', error);
    res.status(500).json({ error: '创建地点失败' });
  }
});

// 更新地点
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '地点名称不能为空' });
    }

    const result = db.prepare('UPDATE locations SET name = ?, description = ? WHERE id = ?').run(name, description, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '地点不存在' });
    }

    res.json({ message: '地点更新成功' });
  } catch (error) {
    console.error('更新地点错误:', error);
    res.status(500).json({ error: '更新地点失败' });
  }
});

// 删除地点
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM locations WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '地点不存在' });
    }

    res.json({ message: '地点删除成功' });
  } catch (error) {
    console.error('删除地点错误:', error);
    res.status(500).json({ error: '删除地点失败' });
  }
});

export default router;
