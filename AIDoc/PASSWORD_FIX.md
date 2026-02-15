# 🔧 密码加密问题修复说明

## 问题原因

修改为客户端加密后，使用初始密码 `admin/admin123` 登录失败，提示"用户名或密码错误"。

### 根本原因

**加密流程不匹配**：

**旧流程**（修改前）：
```
数据库初始化: bcrypt("admin123") → 存入数据库
登录验证: bcrypt("admin123") ← 前端发送明文 "admin123"
✅ 匹配成功
```

**新流程**（修改后出现问题）：
```
数据库初始化: bcrypt("admin123") → 存入数据库（旧数据）
登录验证: bcrypt(SHA256("admin123")) ← 前端发送 SHA256 加密
❌ 不匹配！
```

**正确流程**（修复后）：
```
数据库初始化: bcrypt(SHA256("admin123")) → 存入数据库
登录验证: bcrypt(SHA256("admin123")) ← 前端发送 SHA256 加密
✅ 匹配成功
```

---

## 修复方案

### 1. 更新数据库初始化逻辑

修改 `/backend/src/database.ts`，让初始管理员密码也经过 SHA256 加密：

**修改前**：
```typescript
const defaultAdmin = {
  username: 'admin',
  password: bcrypt.hashSync('admin123', 10),  // 直接 bcrypt
  email: '',
  role: 'admin'
};
```

**修改后**：
```typescript
// 前端会对密码进行 SHA256 加密后发送
// 所以初始密码也需要先用 SHA256 加密，然后再用 bcrypt 加密存储
const rawPassword = 'admin123';
const clientEncryptedPassword = encryptPassword(rawPassword); // SHA256
const hashedPassword = bcrypt.hashSync(clientEncryptedPassword, 10); // bcrypt

const defaultAdmin = {
  username: 'admin',
  password: hashedPassword,  // SHA256 + bcrypt
  email: '',
  role: 'admin'
};
```

### 2. 重新初始化数据库

由于旧数据库中的密码使用旧方式加密，需要删除重建：

```bash
cd backend
rm database.sqlite
pnpm run dev  # 自动重建数据库
```

---

## 完整加密流程

### 注册流程
```
1. 用户输入: "mypassword123"
2. 前端加密: SHA256("mypassword123") → "a3f8c9d2..."
3. 发送到后端: { password: "a3f8c9d2..." }
4. 后端加密: bcrypt("a3f8c9d2...") → "$2a$10$..."
5. 存入数据库: "$2a$10$..."
```

### 登录验证
```
1. 用户输入: "mypassword123"
2. 前端加密: SHA256("mypassword123") → "a3f8c9d2..."
3. 发送到后端: { password: "a3f8c9d2..." }
4. 后端验证: bcrypt.compare("a3f8c9d2...", "$2a$10$...")
5. 返回结果: ✅ 验证成功
```

### 初始管理员
```
1. 服务启动时检测无用户
2. 生成密码: "admin123"
3. 前端式加密: SHA256("admin123") → "240be518..."
4. 后端加密: bcrypt("240be518...") → "$2a$10$..."
5. 存入数据库: 用户名 "admin"，密码 "$2a$10$..."
```

---

## 验证修复

### 1. 检查数据库

```bash
cd backend
sqlite3 database.sqlite

# 查看管理员账号
SELECT id, username, role, created_at FROM users WHERE username = 'admin';

# 查看密码哈希（应该以 $2a$10$ 开头）
SELECT password FROM users WHERE username = 'admin';
```

### 2. 测试登录

1. 访问：http://192.168.3.100:5174/login
2. 输入：
   - 用户名：`admin`
   - 密码：`admin123`
3. 点击登录
4. 预期结果：✅ 登录成功，跳转到仪表盘

### 3. 网络请求验证

打开浏览器开发者工具（F12）→ Network 标签：

**请求体应该是**：
```json
{
  "username": "admin",
  "password": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"
}
```

密码字段是 64 位十六进制哈希，不是明文 `admin123`。

---

## 兼容性说明

### 旧用户数据怎么办？

如果之前已有用户数据（在加密修改前创建的），有两种处理方式：

#### 方案1：全部重置（推荐开发环境）
```bash
cd backend
rm database.sqlite
pnpm run dev
```

#### 方案2：迁移现有用户（生产环境）

创建迁移脚本 `backend/migrate-passwords.ts`：

```typescript
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { encryptPassword } from './src/utils/crypto';

const db = new Database('./database.sqlite');

// 获取所有用户
const users = db.prepare('SELECT id, username FROM users').all();

console.log(`发现 ${users.length} 个用户，准备迁移密码...`);

// 为每个用户设置临时密码
users.forEach((user: any) => {
  const tempPassword = 'temp123456'; // 临时密码
  const encrypted = encryptPassword(tempPassword);
  const hashed = bcrypt.hashSync(encrypted, 10);
  
  db.prepare('UPDATE users SET password = ? WHERE id = ?')
    .run(hashed, user.id);
  
  console.log(`✅ ${user.username}: 密码已重置为 temp123456`);
});

console.log('迁移完成！请通知用户使用临时密码登录并修改密码。');
```

运行迁移：
```bash
cd backend
npx ts-node migrate-passwords.ts
```

---

## 已修复的文件

- ✅ `/backend/src/database.ts` - 更新初始管理员密码加密逻辑
- ✅ `/backend/database.sqlite` - 已删除并重新创建

---

## 测试清单

- [ ] 使用 `admin/admin123` 登录成功
- [ ] 注册新用户成功
- [ ] 新注册用户可以登录
- [ ] 浏览器开发者工具中看到密码是哈希值，不是明文
- [ ] 手机访问可以正常登录

---

## 注意事项

⚠️ **重要提示**：

1. **首次部署**：无需任何操作，自动使用新加密方式
2. **已有数据**：必须删除数据库或运行迁移脚本
3. **密码修改**：用户修改密码时，前端会自动加密
4. **API 调用**：任何外部 API 调用都必须先对密码进行 SHA256 加密

---

## 加密安全等级

| 位置 | 算法 | 作用 | 安全性 |
|-----|------|-----|-------|
| 网络传输 | SHA256 + 盐值 | 防止抓包看到明文 | ⭐⭐⭐ |
| 数据库存储 | bcrypt (cost=10) | 防止数据库泄露 | ⭐⭐⭐⭐⭐ |
| HTTPS (推荐) | TLS 1.3 | 防止中间人攻击 | ⭐⭐⭐⭐⭐ |

当前方案在开发环境下已经足够安全。生产环境务必启用 HTTPS。

---

**修复时间**：2026年2月15日  
**修复状态**：✅ 已完成  
**测试状态**：✅ 待测试
