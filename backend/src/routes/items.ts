import { Router } from 'express';
import QRCode from 'qrcode';
import db from '../database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// 获取所有物品
router.get('/', (req, res) => {
  try {
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
      ORDER BY i.created_at DESC
    `).all();
    res.json(items);
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({ error: '获取物品列表失败' });
  }
});

// 获取即将到期的物品
router.get('/expiring', (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
      ORDER BY i.expiry_date ASC
    `).all(today, futureDate);
    
    res.json(items);
  } catch (error) {
    console.error('获取即将到期物品错误:', error);
    res.status(500).json({ error: '获取即将到期物品失败' });
  }
});

// 获取已过期的物品
router.get('/expired', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

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
      ORDER BY i.expiry_date DESC
    `).all(today);
    
    res.json(items);
  } catch (error) {
    console.error('获取已过期物品错误:', error);
    res.status(500).json({ error: '获取已过期物品失败' });
  }
});

// 获取单个物品
router.get('/:id', (req, res) => {
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
      item_category_id,
      location_id,
      drawer_id,
      purchase_date,
      purchase_price,
      expiry_date,
      quantity,
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

    const result = db.prepare(`
      INSERT INTO items (
        name, description, item_category_id, location_id, drawer_id,
        purchase_date, purchase_price, expiry_date, quantity, image_url, image_data, qr_code, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description,
      item_category_id || null,
      location_id || null,
      drawer_id || null,
      purchase_date || null,
      purchase_price || null,
      expiry_date || null,
      quantity || 1,
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
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      item_category_id,
      location_id,
      drawer_id,
      purchase_date,
      purchase_price,
      expiry_date,
      quantity,
      image_url,
      image_data
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: '物品名称不能为空' });
    }

    const result = db.prepare(`
      UPDATE items 
      SET name = ?, description = ?, item_category_id = ?, location_id = ?, drawer_id = ?,
          purchase_date = ?, purchase_price = ?, expiry_date = ?, quantity = ?, image_url = ?, image_data = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      description,
      item_category_id || null,
      location_id || null,
      drawer_id || null,
      purchase_date || null,
      purchase_price || null,
      expiry_date || null,
      quantity,
      image_url || null,
      image_data || null,
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

// 删除物品
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
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

    res.json(item);
  } catch (error) {
    console.error('查询物品错误:', error);
    res.status(500).json({ error: '查询物品失败' });
  }
});

export default router;
