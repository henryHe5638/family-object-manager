import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';

const router: Router = Router();

router.use(authMiddleware);

// 权限判断：
// 可见性：管理员可见全部；普通用户可见公开的（is_private=0）、自己创建的、以及历史数据（created_by 为空）
// 修改权：仅管理员或创建者
const canAccessDrawer = (drawer: any, req: any) =>
  req.role === 'admin' || !drawer.is_private || !drawer.created_by || drawer.created_by === req.userId;

const canModifyDrawer = (drawer: any, req: any) =>
  req.role === 'admin' || !drawer.created_by || drawer.created_by === req.userId;

// 生成二维码URL
async function generateQRCodeImage(drawerId: number): Promise<string> {
  // 获取网站URL配置
  const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_url');
  const siteUrl = setting ? setting.value : 'http://localhost:5174';
  
  // 生成指向抽屉详情页的URL
  const drawerUrl = `${siteUrl}/drawers/${drawerId}`;
  
  // 生成二维码图片
  const qrCodeImage = await QRCode.toDataURL(drawerUrl);
  return qrCodeImage;
}

// 获取所有抽屉（普通用户仅返回公开的和自己的抽屉）
router.get('/', (req: any, res) => {
  try {
    const ownCondition = req.role === 'admin' ? '' : 'WHERE (d.is_private = 0 OR d.created_by = ? OR d.created_by IS NULL)';
    const ownParams = req.role === 'admin' ? [] : [req.userId];

    const drawers = db.prepare(`
      SELECT d.*, l.name as location_name, u.username as creator_name
      FROM drawers d
      LEFT JOIN locations l ON d.location_id = l.id
      LEFT JOIN users u ON d.created_by = u.id
      ${ownCondition}
      ORDER BY d.created_at DESC
    `).all(...ownParams);
    res.json(drawers);
  } catch (error) {
    console.error('获取抽屉列表错误:', error);
    res.status(500).json({ error: '获取抽屉列表失败' });
  }
});

// 获取单个抽屉详情
router.get('/:id', (req: any, res) => {
  try {
    const { id } = req.params;
    const drawer: any = db.prepare(`
      SELECT d.*, l.name as location_name
      FROM drawers d
      LEFT JOIN locations l ON d.location_id = l.id
      WHERE d.id = ?
    `).get(id);
    
    if (!drawer) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    if (!canAccessDrawer(drawer, req)) {
      return res.status(403).json({ error: '无权访问该抽屉' });
    }

    // 获取抽屉中的物品（普通用户不显示他人私有的物品）
    const itemVisibility = req.role === 'admin' ? '' : 'AND (i.is_private = 0 OR i.created_by = ? OR i.created_by IS NULL)';
    const itemParams = req.role === 'admin' ? [id] : [id, req.userId];
    const items = db.prepare(`
      SELECT i.*, ic.name as category_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      WHERE i.drawer_id = ? ${itemVisibility}
    `).all(...itemParams);

    drawer.items = items;
    res.json(drawer);
  } catch (error) {
    console.error('获取抽屉错误:', error);
    res.status(500).json({ error: '获取抽屉失败' });
  }
});

// 获取抽屉二维码
router.get('/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const drawer: any = db.prepare('SELECT * FROM drawers WHERE id = ?').get(id);
    
    if (!drawer) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    const qrCodeImage = await generateQRCodeImage(Number(id));
    
    res.json({
      qrCodeImage,
      drawerName: drawer.name
    });
  } catch (error) {
    console.error('获取抽屉二维码错误:', error);
    res.status(500).json({ error: '获取抽屉二维码失败' });
  }
});

// 通过二维码获取抽屉
router.get('/qr/:qrCode', (req, res) => {
  try {
    const { qrCode } = req.params;
    const drawer: any = db.prepare(`
      SELECT d.*, l.name as location_name
      FROM drawers d
      LEFT JOIN locations l ON d.location_id = l.id
      WHERE d.qr_code = ?
    `).get(qrCode);
    
    if (!drawer) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    if (!canAccessDrawer(drawer, req)) {
      return res.status(403).json({ error: '无权访问该抽屉' });
    }

    // 获取抽屉中的物品（普通用户不显示他人私有的物品）
    const itemVisibility = req.role === 'admin' ? '' : 'AND (i.is_private = 0 OR i.created_by = ? OR i.created_by IS NULL)';
    const itemParams = req.role === 'admin' ? [drawer.id] : [drawer.id, req.userId];
    const items = db.prepare(`
      SELECT i.*, ic.name as category_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      WHERE i.drawer_id = ? ${itemVisibility}
    `).all(...itemParams);

    drawer.items = items;
    res.json(drawer);
  } catch (error) {
    console.error('获取抽屉错误:', error);
    res.status(500).json({ error: '获取抽屉失败' });
  }
});

// 创建抽屉
router.post('/', async (req: any, res) => {
  try {
    const { name, description, location_id, parent_id, is_private, image_url, image_data } = req.body;

    if (!name) {
      return res.status(400).json({ error: '抽屉名称不能为空' });
    }

    // 先创建抽屉记录，qr_code存储drawerId字符串
    const result = db.prepare(`
      INSERT INTO drawers (name, description, qr_code, is_private, location_id, parent_id, image_url, image_data, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, '', is_private ? 1 : 0, location_id, parent_id, image_url, image_data, req.userId);

    const drawerId = Number(result.lastInsertRowid);
    
    // 更新qr_code为drawerId
    db.prepare('UPDATE drawers SET qr_code = ? WHERE id = ?').run(drawerId.toString(), drawerId);

    // 生成二维码图片（Base64）- 使用URL
    const qrCodeImage = await generateQRCodeImage(drawerId);

    res.status(201).json({
      message: '抽屉创建成功',
      id: drawerId,
      qrCode: drawerId.toString(),
      qrCodeImage
    });
  } catch (error) {
    console.error('创建抽屉错误:', error);
    res.status(500).json({ error: '创建抽屉失败' });
  }
});

// 更新抽屉
router.put('/:id', (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, location_id, parent_id, is_private, image_url, image_data } = req.body;

    if (!name) {
      return res.status(400).json({ error: '抽屉名称不能为空' });
    }

    const existing: any = db.prepare('SELECT * FROM drawers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '抽屉不存在' });
    }
    if (!canModifyDrawer(existing, req)) {
      return res.status(403).json({ error: '无权修改该抽屉' });
    }

    // 获取旧的地点ID
    const oldDrawer: any = existing;

    const result = db.prepare(`
      UPDATE drawers 
      SET name = ?, description = ?, location_id = ?, parent_id = ?, is_private = ?, image_url = ?, image_data = ?
      WHERE id = ?
    `).run(name, description, location_id, parent_id, is_private ? 1 : 0, image_url, image_data, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    // 如果地点发生了变化，更新抽屉中所有物品的地点
    if (oldDrawer && oldDrawer.location_id !== location_id) {
      db.prepare(`
        UPDATE items 
        SET location_id = ?
        WHERE drawer_id = ?
      `).run(location_id, id);
    }

    res.json({ message: '抽屉更新成功' });
  } catch (error) {
    console.error('更新抽屉错误:', error);
    res.status(500).json({ error: '更新抽屉失败' });
  }
});

// 删除抽屉
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM drawers WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    res.json({ message: '抽屉删除成功' });
  } catch (error) {
    console.error('删除抽屉错误:', error);
    res.status(500).json({ error: '删除抽屉失败' });
  }
});

// 重新生成抽屉二维码
router.post('/:id/regenerate-qr', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    // 检查抽屉是否存在
    const drawer: any = db.prepare('SELECT * FROM drawers WHERE id = ?').get(id);

    if (!drawer) {
      return res.status(404).json({ error: '抽屉不存在' });
    }

    if (!canAccessDrawer(drawer, req)) {
      return res.status(403).json({ error: '无权访问该抽屉' });
    }

    // 生成二维码图片 - 使用URL
    const qrCodeImage = await generateQRCodeImage(Number(id));

    res.json({
      message: '二维码重新生成成功',
      qrCode: id,
      qrCodeImage
    });
  } catch (error) {
    console.error('重新生成二维码错误:', error);
    res.status(500).json({ error: '重新生成二维码失败' });
  }
});

export default router;
