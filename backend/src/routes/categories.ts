import { Router } from 'express';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';

const router: Router = Router();

router.use(authMiddleware);

// 每个物品类目带有的分组信息子查询（首个大类名，兼容旧字段）
const GROUP_NAME_SQL = `(SELECT cg.name FROM item_category_map m JOIN category_groups cg ON cg.id = m.group_id WHERE m.item_category_id = ic.id ORDER BY cg.name LIMIT 1)`;

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

// 获取单个大类下的所有物品类目（通过映射表，一个物品可属于多个大类）
router.get('/groups/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const items = db.prepare(`
      SELECT ic.* FROM item_categories ic
      JOIN item_category_map m ON m.item_category_id = ic.id
      WHERE m.group_id = ?
      ORDER BY ic.name
    `).all(id);
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

    // 检查该大类下是否有物品类目（通过映射表）
    const itemCount = db.prepare('SELECT COUNT(*) as count FROM item_category_map WHERE group_id = ?').get(id) as any;
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
// 规则：物品名称全局唯一（同名视为同一个物品），一个物品可映射到多个大类

// 获取所有物品类目（含所属大类信息）
router.get('/items', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT ic.*, ${GROUP_NAME_SQL} as group_name,
             (SELECT GROUP_CONCAT(cg.name, '、') FROM item_category_map m JOIN category_groups cg ON cg.id = m.group_id WHERE m.item_category_id = ic.id) as all_group_names
      FROM item_categories ic
      ORDER BY ic.name
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
      SELECT ic.*, ${GROUP_NAME_SQL} as group_name
      FROM item_categories ic
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

// 创建物品类目（同名自动复用，仅补充大类映射）
router.post('/items', (req, res) => {
  try {
    const { group_id, name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '物品类目名称不能为空' });
    }

    if (!group_id) {
      return res.status(400).json({ error: '必须选择一个大类' });
    }

    const trimmed = name.trim();

    // 同名物品视为一个：已存在则只补充大类映射
    const existing: any = db.prepare('SELECT id FROM item_categories WHERE name = ?').get(trimmed);
    if (existing) {
      db.prepare('INSERT OR IGNORE INTO item_category_map (item_category_id, group_id) VALUES (?, ?)').run(existing.id, group_id);
      return res.status(200).json({
        message: '已关联到现有同名物品类目',
        id: existing.id
      });
    }

    const result = db.prepare('INSERT INTO item_categories (group_id, name, description) VALUES (?, ?, ?)').run(group_id, trimmed, description || `${trimmed}`);
    const newId = result.lastInsertRowid;
    db.prepare('INSERT INTO item_category_map (item_category_id, group_id) VALUES (?, ?)').run(newId, group_id);

    res.status(201).json({
      message: '物品类目创建成功',
      id: newId
    });
  } catch (error) {
    console.error('创建物品类目错误:', error);
    res.status(500).json({ error: '创建物品类目失败' });
  }
});

// 更新物品类目（重命名 / 调整所属大类）
router.put('/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '物品类目名称不能为空' });
    }

    const target: any = db.prepare('SELECT id FROM item_categories WHERE id = ?').get(id);
    if (!target) {
      return res.status(404).json({ error: '物品类目不存在' });
    }

    const trimmed = name.trim();
    // 名称冲突检查（排除自身）
    const duplicate: any = db.prepare('SELECT id FROM item_categories WHERE name = ? AND id != ?').get(trimmed, id);
    if (duplicate) {
      return res.status(400).json({ error: `物品名称「${trimmed}」已存在，同名物品视为同一个` });
    }

    db.prepare('UPDATE item_categories SET group_id = ?, name = ?, description = ? WHERE id = ?')
      .run(group_id || target.group_id, trimmed, description, id);

    // 调整大类：替换为该单一映射
    if (group_id) {
      db.prepare('DELETE FROM item_category_map WHERE item_category_id = ?').run(id);
      db.prepare('INSERT OR IGNORE INTO item_category_map (item_category_id, group_id) VALUES (?, ?)').run(id, group_id);
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
