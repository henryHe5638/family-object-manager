import { Router } from 'express';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';

const router: Router = Router();

router.use(authMiddleware);

// ========== 大类（Category Groups）API ==========

// 获取所有大类
router.get('/groups', (req, res) => {
  try {
    const groups = db.prepare('SELECT * FROM category_groups ORDER BY name').all();
    res.json(groups);
  } catch (error) {
    console.error('获取大类列表错误:', error);
    res.status(500).json({ error: '获取大类列表失败' });
  }
});

// 获取单个大类下的所有物品类目
router.get('/groups/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const items = db.prepare('SELECT * FROM item_categories WHERE group_id = ? ORDER BY name').all(id);
    res.json(items);
  } catch (error) {
    console.error('获取大类物品列表错误:', error);
    res.status(500).json({ error: '获取大类物品列表失败' });
  }
});

// 创建大类（管理员）
router.post('/groups', adminOnly, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '大类名称不能为空' });
    }

    const result = db.prepare('INSERT INTO category_groups (name, description) VALUES (?, ?)').run(name, description);

    res.status(201).json({
      message: '大类创建成功',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('创建大类错误:', error);
    res.status(500).json({ error: '创建大类失败' });
  }
});

// 更新大类（管理员）
router.put('/groups/:id', adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '大类名称不能为空' });
    }

    const result = db.prepare('UPDATE category_groups SET name = ?, description = ? WHERE id = ?').run(name, description, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '大类不存在' });
    }

    res.json({ message: '大类更新成功' });
  } catch (error) {
    console.error('更新大类错误:', error);
    res.status(500).json({ error: '更新大类失败' });
  }
});

// 删除大类（管理员）
router.delete('/groups/:id', adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查该大类下是否有物品类目
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM item_categories WHERE group_id = ?').get(id) as any;
    if (itemCount.count > 0) {
      return res.status(400).json({ error: '该大类下还有物品类目，无法删除' });
    }
    
    const result = db.prepare('DELETE FROM category_groups WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '大类不存在' });
    }

    res.json({ message: '大类删除成功' });
  } catch (error) {
    console.error('删除大类错误:', error);
    res.status(500).json({ error: '删除大类失败' });
  }
});

// ========== 物品类目（Item Categories）API ==========

// 获取所有物品类目
router.get('/items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT ic.*, cg.name as group_name
      FROM item_categories ic
      LEFT JOIN category_groups cg ON ic.group_id = cg.id
      ORDER BY cg.name, ic.name
    `).all();
    res.json(items);
  } catch (error) {
    console.error('获取物品类目列表错误:', error);
    res.status(500).json({ error: '获取物品类目列表失败' });
  }
});

// 搜索物品类目（用于自动完成）
router.get('/items/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json([]);
    }

    const items = db.prepare(`
      SELECT ic.*, cg.name as group_name
      FROM item_categories ic
      LEFT JOIN category_groups cg ON ic.group_id = cg.id
      WHERE ic.name LIKE ?
      ORDER BY ic.name
      LIMIT 20
    `).all(`%${q}%`);
    
    res.json(items);
  } catch (error) {
    console.error('搜索物品类目错误:', error);
    res.status(500).json({ error: '搜索物品类目失败' });
  }
});

// 创建物品类目
router.post('/items', (req, res) => {
  try {
    const { group_id, name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '物品类目名称不能为空' });
    }
    
    if (!group_id) {
      return res.status(400).json({ error: '必须选择一个大类' });
    }

    const result = db.prepare('INSERT INTO item_categories (group_id, name, description) VALUES (?, ?, ?)').run(group_id, name, description);

    res.status(201).json({
      message: '物品类目创建成功',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('创建物品类目错误:', error);
    res.status(500).json({ error: '创建物品类目失败' });
  }
});

// 更新物品类目
router.put('/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: '物品类目名称不能为空' });
    }
    
    if (!group_id) {
      return res.status(400).json({ error: '必须选择一个大类' });
    }

    const result = db.prepare('UPDATE item_categories SET group_id = ?, name = ?, description = ? WHERE id = ?').run(group_id, name, description, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '物品类目不存在' });
    }

    res.json({ message: '物品类目更新成功' });
  } catch (error) {
    console.error('更新物品类目错误:', error);
    res.status(500).json({ error: '更新物品类目失败' });
  }
});

// 删除物品类目
router.delete('/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有物品使用该类目
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM items WHERE item_category_id = ?').get(id) as any;
    if (itemCount.count > 0) {
      return res.status(400).json({ error: '该物品类目正在被使用，无法删除' });
    }
    
    const result = db.prepare('DELETE FROM item_categories WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '物品类目不存在' });
    }

    res.json({ message: '物品类目删除成功' });
  } catch (error) {
    console.error('删除物品类目错误:', error);
    res.status(500).json({ error: '删除物品类目失败' });
  }
});

export default router;
