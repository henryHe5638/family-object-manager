import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database';
import { authMiddleware } from '../middleware/auth';
import { adminOnly } from '../middleware/adminCheck';
import { encryptPassword } from '../utils/crypto';

const router = Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 检查是否允许注册
    const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('allow_guest_register');
    const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (userCount.count > 0 && setting && setting.value === 'false') {
      return res.status(403).json({ error: '当前不允许游客注册，请联系管理员' });
    }

    // 检查用户是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 第一个用户自动成为管理员
    const role = userCount.count === 0 ? 'admin' : 'user';

    // 客户端已经对密码进行了一次 SHA256 加密
    // 这里再用 bcrypt 进行二次加密存储
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)').run(username, hashedPassword, email, role);

    res.status(201).json({ 
      message: '用户注册成功',
      userId: result.lastInsertRowid,
      role: role
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 查找用户
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 检查账号是否被停用
    if (user.disabled === 1) {
      return res.status(403).json({ error: '账号已被停用，请联系管理员' });
    }

    // 客户端发送的是 SHA256 加密后的密码
    // 数据库中存储的是 bcrypt(客户端加密密码)
    // 所以直接用 bcrypt 比对即可
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req: any, res) => {
  try {
    const user: any = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 获取所有用户（需要认证）
router.get('/', authMiddleware, (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, disabled, created_at FROM users').all();
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 用户修改自己的密码
router.put('/change-password', authMiddleware, async (req: any, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }

    // 获取当前用户
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '旧密码错误' });
    }

    // 更新新密码（客户端已经对新密码进行了 SHA256 加密）
    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.userId);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 删除用户
router.delete('/:id', authMiddleware, adminOnly, (req: any, res) => {
  try {
    const { id } = req.params;
    
    // 不能删除自己
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: '不能删除当前登录用户' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 公共接口：返回用户数量（用于前端决定是否显示注册入口）
router.get('/count', (req, res) => {
  try {
    const userCount: any = db.prepare('SELECT COUNT(*) as count FROM users').get();
    res.json({ count: userCount.count });
  } catch (error) {
    console.error('获取用户数量错误:', error);
    res.status(500).json({ error: '获取用户数量失败' });
  }
});

// 管理员通过后台创建用户
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 客户端已经对密码进行了 SHA256 加密
    // 这里再用 bcrypt 进行二次加密存储
    const hashed = await bcrypt.hash(password, 10);
    const insert = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');
    const result = insert.run(username, hashed, email || '', role === 'admin' ? 'admin' : 'user');

    res.status(201).json({ message: '用户创建成功', userId: result.lastInsertRowid });
  } catch (error) {
    console.error('管理员创建用户错误:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 管理员更新用户（如修改 role 或 email 或重置密码或停用账号）
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email, password, disabled } = req.body;

    const user: any = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    if (password) {
      // 客户端已经对密码进行了 SHA256 加密
      // 这里再用 bcrypt 进行二次加密存储
      const hashed = await bcrypt.hash(password, 10);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, id);
    }

    if (role) {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role === 'admin' ? 'admin' : 'user', id);
    }

    if (typeof email !== 'undefined') {
      db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email || '', id);
    }

    if (typeof disabled !== 'undefined') {
      db.prepare('UPDATE users SET disabled = ? WHERE id = ?').run(disabled ? 1 : 0, id);
    }

    res.json({ message: '用户更新成功' });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

export default router;

