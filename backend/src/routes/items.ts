import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../database';
import { authMiddleware } from '../middleware/auth';

const router: Router = Router();

router.use(authMiddleware);

// 物品状态取值
const VALID_STATUSES = ['stored', 'in_use', 'discarded'];

// 可见性：管理员可见全部；普通用户可见公开的（is_private=0）、自己创建的、以及历史数据（created_by 为空）
const canAccessItem = (item: any, req: any) =>
  req.role === 'admin' || !item.is_private || !item.created_by || item.created_by === req.userId;

// 修改权：仅管理员或创建者（公开物品其他人只能查看，不能修改）
const canModifyItem = (item: any, req: any) =>
  req.role === 'admin' || !item.created_by || item.created_by === req.userId;

// 私有状态跟随抽屉：物品放入抽屉时，is_private 以抽屉为准；未选抽屉时用传入值
const resolveItemPrivacy = (drawerId: any, isPrivate: any): number => {
  if (drawerId) {
    const drawer: any = db.prepare('SELECT is_private FROM drawers WHERE id = ?').get(drawerId);
    if (drawer) return drawer.is_private ? 1 : 0;
  }
  return isPrivate ? 1 : 0;
};

// 获取所有物品（支持 ?status=stored|in_use|discarded 筛选，普通用户仅返回公开的和自己的物品）
router.get('/', (req: any, res) => {
  try {
    const conditions: string[] = [];
    const params: any[] = [];

    if (req.role !== 'admin') {
      conditions.push('(i.is_private = 0 OR i.created_by = ? OR i.created_by IS NULL)');
      params.push(req.userId);
    }

    const status = req.query.status as string;
    if (status && VALID_STATUSES.includes(status)) {
      conditions.push('i.status = ?');
      params.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = db.prepare(`
      SELECT i.*, 
             ic.name as category_name,
             l.name as location_name,
             d.name as drawer_name,
             u.username as creator_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN drawers d ON i.drawer_id = d.id
      LEFT JOIN users u ON i.created_by = u.id
      ${where}
      ORDER BY i.created_at DESC
    `).all(...params);
    res.json(items);
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({ error: '获取物品列表失败' });
  }
});

// 获取即将到期的物品
router.get('/expiring', (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const ownCondition = req.role === 'admin' ? '' : 'AND (i.is_private = 0 OR i.created_by = ? OR i.created_by IS NULL)';
    const ownParams = req.role === 'admin' ? [] : [req.userId];

    const items = db.prepare(`
      SELECT i.*, 
             ic.name as category_name,
             l.name as location_name,
             d.name as drawer_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN drawers d ON i.drawer_id = d.id
      WHERE i.expiry_date IS NOT NULL 
        AND i.expiry_date BETWEEN ? AND ?
        AND (i.status IS NULL OR i.status != 'discarded')
        ${ownCondition}
      ORDER BY i.expiry_date ASC
    `).all(today, futureDate, ...ownParams);
    
    res.json(items);
  } catch (error) {
    console.error('获取即将到期物品错误:', error);
    res.status(500).json({ error: '获取即将到期物品失败' });
  }
});

// 获取已过期的物品
router.get('/expired', (req: any, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const ownCondition = req.role === 'admin' ? '' : 'AND (i.is_private = 0 OR i.created_by = ? OR i.created_by IS NULL)';
    const ownParams = req.role === 'admin' ? [] : [req.userId];

    const items = db.prepare(`
      SELECT i.*, 
             ic.name as category_name,
             l.name as location_name,
             d.name as drawer_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN drawers d ON i.drawer_id = d.id
      WHERE i.expiry_date IS NOT NULL AND i.expiry_date < ?
        AND (i.status IS NULL OR i.status != 'discarded')
        ${ownCondition}
      ORDER BY i.expiry_date DESC
    `).all(today, ...ownParams);
    
    res.json(items);
  } catch (error) {
    console.error('获取已过期物品错误:', error);
    res.status(500).json({ error: '获取已过期物品失败' });
  }
});

// 获取单个物品
router.get('/:id', (req: any, res) => {
  try {
    const { id } = req.params;
    const item = db.prepare(`
      SELECT i.*, 
             ic.name as category_name,
             l.name as location_name,
             d.name as drawer_name,
             u.username as creator_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN drawers d ON i.drawer_id = d.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `).get(id);
    
    if (!item) {
      return res.status(404).json({ error: '物品不存在' });
    }

    if (!canAccessItem(item, req)) {
      return res.status(403).json({ error: '无权访问该物品' });
    }

    res.json(item);
  } catch (error) {
    console.error('获取物品错误:', error);
    res.status(500).json({ error: '获取物品失败' });
  }
});

// 创建物品
router.post('/', async (req: any, res) => {
  try {
    const {
      name,
      description,
      brand,
      size,
      item_category_id,
      location_id,
      drawer_id,
      purchase_date,
      production_date,
      purchase_price,
      expiry_date,
      quantity,
      is_private,
      image_url,
      image_data
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: '物品名称不能为空' });
    }

    // 验证 created_by 用户是否存在
    if (req.userId) {
      const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.userId);
      if (!user) {
        return res.status(400).json({ error: '用户不存在' });
      }
    }

    // 生成唯一的二维码字符串
    const qrCode = `ITEM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 放入抽屉时私有状态跟随抽屉
    const itemPrivate = resolveItemPrivacy(drawer_id, is_private);

    const result = db.prepare(`
      INSERT INTO items (
        name, description, brand, size, item_category_id, location_id, drawer_id,
        purchase_date, production_date, purchase_price, expiry_date, quantity, is_private, image_url, image_data, qr_code, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description,
      brand || null,
      size || null,
      item_category_id || null,
      location_id || null,
      drawer_id || null,
      purchase_date || null,
      production_date || null,
      purchase_price || null,
      expiry_date || null,
      quantity || 1,
      itemPrivate,
      image_url || null,
      image_data || null,
      qrCode,
      req.userId || null
    );

    res.status(201).json({
      message: '物品创建成功',
      id: result.lastInsertRowid,
      qr_code: qrCode
    });
  } catch (error: any) {
    console.error('创建物品错误:', error);
    console.error('错误详情:', {
      code: error.code,
      message: error.message,
      userId: req.userId,
      body: req.body
    });
    res.status(500).json({ error: '创建物品失败: ' + error.message });
  }
});

// 更新物品
router.put('/:id', (req: any, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      brand,
      size,
      item_category_id,
      location_id,
      drawer_id,
      purchase_date,
      production_date,
      purchase_price,
      expiry_date,
      quantity,
      is_private,
      image_url,
      image_data,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: '物品名称不能为空' });
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: '无效的物品状态' });
    }

    const existing: any = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '物品不存在' });
    }
    if (!canModifyItem(existing, req)) {
      return res.status(403).json({ error: '无权修改该物品' });
    }

    // 放入/移入抽屉时私有状态跟随抽屉；未选抽屉时用传入值
    const itemPrivate = resolveItemPrivacy(drawer_id, is_private);

    const result = db.prepare(`
      UPDATE items 
      SET name = ?, description = ?, brand = ?, size = ?, item_category_id = ?, location_id = ?, drawer_id = ?,
          purchase_date = ?, production_date = ?, purchase_price = ?, expiry_date = ?, quantity = ?,
          is_private = ?, image_url = ?, image_data = ?,
          status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      description,
      brand || null,
      size || null,
      item_category_id || null,
      location_id || null,
      drawer_id || null,
      purchase_date || null,
      production_date || null,
      purchase_price || null,
      expiry_date || null,
      quantity,
      itemPrivate,
      image_url || null,
      image_data || null,
      status || existing.status || 'stored',
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    res.json({ message: '物品更新成功' });
  } catch (error) {
    console.error('更新物品错误:', error);
    res.status(500).json({ error: '更新物品失败' });
  }
});

// 快捷更新物品状态（使用/丢弃/恢复）
router.patch('/:id/status', (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: '无效的物品状态' });
    }

    const existing: any = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '物品不存在' });
    }
    if (!canModifyItem(existing, req)) {
      return res.status(403).json({ error: '无权修改该物品' });
    }

    db.prepare(`
      UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);

    res.json({ message: '状态更新成功', status });
  } catch (error) {
    console.error('更新物品状态错误:', error);
    res.status(500).json({ error: '更新物品状态失败' });
  }
});

// 删除物品
router.delete('/:id', (req: any, res) => {
  try {
    const { id } = req.params;

    const existing: any = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '物品不存在' });
    }
    if (!canModifyItem(existing, req)) {
      return res.status(403).json({ error: '无权删除该物品' });
    }

    const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '物品不存在' });
    }

    res.json({ message: '物品删除成功' });
  } catch (error) {
    console.error('删除物品错误:', error);
    res.status(500).json({ error: '删除物品失败' });
  }
});

// 生成物品二维码图片
router.get('/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const item: any = db.prepare('SELECT qr_code FROM items WHERE id = ?').get(id);
    
    if (!item || !item.qr_code) {
      return res.status(404).json({ error: '物品不存在或未生成二维码' });
    }

    // 获取网站URL配置
    const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_url');
    const siteUrl = setting ? setting.value : 'http://localhost:5174';
    
    // 生成二维码图片 (包含完整的跳转 URL)
    const qrCodeData = `${siteUrl}/items/${id}`;
    
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: item.qr_code,
      qrCodeImage, // Base64 图片
      url: qrCodeData
    });
  } catch (error) {
    console.error('生成二维码错误:', error);
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 通过二维码查询物品
router.get('/qr/:qrCode', (req, res) => {
  try {
    const { qrCode } = req.params;
    const item = db.prepare(`
      SELECT i.*, 
             ic.name as category_name,
             l.name as location_name,
             d.name as drawer_name,
             u.username as creator_name
      FROM items i
      LEFT JOIN item_categories ic ON i.item_category_id = ic.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN drawers d ON i.drawer_id = d.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.qr_code = ?
    `).get(qrCode);
    
    if (!item) {
      return res.status(404).json({ error: '物品不存在' });
    }

    if (!canAccessItem(item, req)) {
      return res.status(403).json({ error: '无权访问该物品' });
    }

    res.json(item);
  } catch (error) {
    console.error('查询物品错误:', error);
    res.status(500).json({ error: '查询物品失败' });
  }
});

export default router;
