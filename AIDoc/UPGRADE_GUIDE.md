# 系统升级指南

## 已完成的后端改动

### 1. 数据库Schema ✅
- ✅ 用户表添加 `role` 字段 (admin/user)
- ✅ 新增 `settings` 配置表
- ✅ 新增 `category_groups` 大类表
- ✅ 新增 `item_categories` 物品类目表
- ✅ 修改 items 表的 `category_id` 为 `item_category_id`

### 2. 内置数据 ✅
- ✅ 12个大类（食品、调味品、干货、零食等）
- ✅ 200+常用物品（大米、食用油、洗发水等）
- ✅ 默认配置（注册开关、网站URL）

### 3. 权限中间件 ✅
- ✅ `authMiddleware` 增强：添加role到请求
- ✅ `adminOnly` 中间件：管理员权限检查

### 4. 新增API ✅
- ✅ `/api/settings` - 系统配置管理
- ✅ `/api/categories/groups` - 大类管理
- ✅ `/api/categories/items` - 物品类目管理
- ✅ `/api/categories/items/search` - 搜索物品

##需要完成的改动

### 后端 (高优先级)

#### 1. 用户API改动 (`backend/src/routes/users.ts`)

```typescript
// 在注册接口开头添加：
router.post('/register', async (req, res) => {
  try {
    // 检查是否允许注册
    const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('allow_guest_register');
    if (setting && setting.value === 'false') {
      return res.status(403).json({ error: '当前不允许游客注册，请联系管理员' });
    }

    // 检查是否为第一个用户（自动设为管理员）
    const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const role = userCount.count === 0 ? 'admin' : 'user';

    // ... 现有代码 ...

    // 修改INSERT语句：
    const result = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)').run(username, hashedPassword, email, role);

    res.status(201).json({ 
      message: '用户注册成功',
      userId: result.lastInsertRowid,
      role: role
    });
  } catch (error) {
    // ... 错误处理 ...
  }
});

// 在登录接口返回中添加role：
res.json({
  token,
  user: {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role  // 新增
  }
});

// 修改/me接口返回role：
const user: any = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.userId);

// 获取所有用户接口返回role：
const users = db.prepare('SELECT id, username, email, role, created_at FROM users').all();

// 删除用户和修改密码需要管理员权限：
import { adminOnly } from '../middleware/adminCheck';
router.delete('/:id', authMiddleware, adminOnly, (req: any, res) => {
  // ... 现有代码 ...
});
```

#### 2. 地点/抽屉删除权限 (`backend/src/routes/locations.ts`, `drawers.ts`)

```typescript
import { adminOnly } from '../middleware/adminCheck';

// 删除操作添加adminOnly：
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  // ... 现有代码 ...
});
```

#### 3. 二维码生成改为URL (`backend/src/routes/drawers.ts`)

```typescript
import QRCode from 'qrcode';

// 修改生成二维码的函数：
const generateQRCode = async (drawerId: number): Promise<string> => {
  // 获取网站URL配置
  const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('site_url');
  const siteUrl = setting ? setting.value : 'http://localhost:5174';
  
  // 生成指向抽屉详情页的URL
  const drawerUrl = `${siteUrl}/drawers/${drawerId}`;
  
  // 生成二维码图片
  const qrCodeImage = await QRCode.toDataURL(drawerUrl);
  return qrCodeImage;
};

// 在创建和重新生成二维码的地方使用：
const qrCodeImage = await generateQRCode(Number(result.lastInsertRowid));
```

#### 4. 物品API改动 (`backend/src/routes/items.ts`)

```typescript
// 修改所有SQL查询，将category_id改为item_category_id：
// 创建
const result = db.prepare(`
  INSERT INTO items (name, description, item_category_id, location_id, drawer_id, purchase_date, purchase_price, expiry_date, quantity, created_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(name, description, item_category_id, location_id, drawer_id, purchase_date, purchase_price, expiry_date, quantity, req.userId);

// 查询（需要JOIN item_categories和category_groups）
const items = db.prepare(`
  SELECT 
    i.*,
    ic.name as category_name,
    cg.name as group_name,
    l.name as location_name,
    d.name as drawer_name
  FROM items i
  LEFT JOIN item_categories ic ON i.item_category_id = ic.id
  LEFT JOIN category_groups cg ON ic.group_id = cg.id
  LEFT JOIN locations l ON i.location_id = l.id
  LEFT JOIN drawers d ON i.drawer_id = d.id
  ORDER BY i.created_at DESC
`).all();

// 到期查询添加过滤：只查询有到期日期的
const expiringItems = db.prepare(`
  SELECT i.*, ic.name as category_name, l.name as location_name
  FROM items i
  LEFT JOIN item_categories ic ON i.item_category_id = ic.id
  LEFT JOIN locations l ON i.location_id = l.id
  WHERE i.expiry_date IS NOT NULL
    AND i.expiry_date != ''
    AND date(i.expiry_date) BETWEEN date('now') AND date('now', '+' || ? || ' days')
  ORDER BY i.expiry_date
`).all(days);
```

### 前端改动 (详细文档另见)

由于前端改动较多，我将创建一个独立的前端升级指南。

#### 快速概览：

1. **权限管理**
   - store添加role字段
   - 路由守卫检查管理员权限
   - UI按钮/菜单根据role显示

2. **类目选择器**
   - 先选大类
   - 再选/搜索物品
   - 支持自定义物品名

3. **抽屉详情页** 
   - 添加物品表单
   - 编辑/删除按钮
   - Modal弹窗

4. **到期提醒铃铛**
   - 右上角Bell图标
   - Badge显示数量
   - 点击展开列表

5. **二维码扫描**
   - 直接显示抽屉详情
   - 不再显示字符串

## 快速测试

1. 重启后端（已完成）
2. 第一个注册的用户自动成为管理员
3. 测试两级类目选择
4. 测试管理员权限功能

## 注意事项

⚠️ 旧数据库不兼容，需要重新初始化
⚠️ 第一个注册用户会自动成为管理员
⚠️ 可通过 /api/settings 配置注册开关和网站URL
