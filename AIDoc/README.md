# 家庭物资管理系统

**作者：wibecoding**  
**开源许可：MIT License**

一个功能完整的全栈家庭物资管理系统，基于现代化技术栈构建，支持二次开发与扩展。采用前后端分离架构，提供完整的用户管理、物品管理、地点管理、抽屉系统和二维码功能。

## 🌟 核心特性

### 📦 物品管理
- **完整的CRUD操作**：添加、查看、编辑、删除物品
- **智能分类系统**：12个大类 + 200+子类目的二级分类体系
- **时间管理**：购买时间、到期时间跟踪
- **价格管理**：购买价格记录与统计
- **数量管理**：库存数量实时更新
- **过期提醒**：登录后自动弹窗提示即将过期和已过期物品

### 🏠 地点管理
- **多层级地点**：支持房间、区域的层级管理
- **智能关联**：物品与地点的关联管理
- **可视化界面**：直观的地点选择和管理界面

### 📁 抽屉系统
- **文件夹式组织**：类似电脑文件夹的物品组织方式
- **二维码集成**：每个抽屉自动生成唯一二维码
- **快速扫描**：扫描二维码即可查看抽屉详情和包含物品
- **打印功能**：支持二维码标签打印

### 👥 用户权限
- **角色系统**：管理员/普通用户两级权限
- **首用户特权**：首位注册用户自动获得管理员权限
- **权限控制**：细粒度的功能权限控制
- **游客注册**：可配置是否允许游客注册

### 🔒 安全认证
- **JWT认证**：安全的Token认证机制
- **密码加密**：bcryptjs加密存储用户密码
- **前端加密传输**：密码传输前客户端加密
- **路由守卫**：完整的前后端权限验证

## 🛠️ 技术架构

### 后端技术栈
- **框架**：Node.js + Express + TypeScript
- **数据库**：SQLite (better-sqlite3) - 轻量级，免配置
- **认证**：JSON Web Token (JWT)
- **加密**：bcryptjs 密码哈希
- **二维码**：qrcode 库
- **文件上传**：multer 中间件
- **跨域处理**：CORS

### 前端技术栈
- **框架**：Vue 3 (Composition API) + TypeScript
- **路由**：Vue Router 4
- **状态管理**：Pinia
- **UI框架**：Tailwind CSS
- **HTTP客户端**：Axios
- **构建工具**：Vite
- **二维码扫描**：jsQR 库

## 📁 项目结构

```
family-object-manager/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   │   ├── users.ts    # 用户管理API
│   │   │   ├── locations.ts # 地点管理API
│   │   │   ├── categories.ts # 类目管理API
│   │   │   ├── drawers.ts  # 抽屉管理API
│   │   │   ├── items.ts     # 物品管理API
│   │   │   ├── settings.ts # 系统设置API
│   │   │   └── upload.ts   # 文件上传API
│   │   ├── middleware/     # 中间件
│   │   │   ├── auth.ts     # JWT认证中间件
│   │   │   ├── adminCheck.ts # 管理员权限检查
│   │   │   └── upload.ts   # 文件上传中间件
│   │   ├── utils/          # 工具函数
│   │   │   └── crypto.ts   # 加密工具
│   │   ├── database.ts     # SQLite数据库初始化
│   │   └── index.ts        # Express服务器入口
│   ├── uploads/            # 上传文件存储目录
│   ├── package.json
│   ├── tsconfig.json
│   └── .env               # 环境变量配置
│
├── frontend/              # 前端Vue应用
│   ├── src/
│   │   ├── api/          # API服务封装
│   │   │   ├── index.ts  # API基础配置
│   │   │   └── modules.ts # API模块
│   │   ├── components/   # Vue公共组件
│   │   │   ├── Layout.vue       # 主布局组件
│   │   │   ├── QRCodeDisplay.vue # 二维码显示
│   │   │   ├── ImageUpload.vue  # 图片上传
│   │   │   ├── ExpiryModal.vue  # 过期提醒弹窗
│   │   │   └── CategorySelector.vue # 类目选择器
│   │   ├── views/        # 页面组件
│   │   │   ├── Login.vue     # 登录页
│   │   │   ├── Register.vue  # 注册页
│   │   │   ├── Dashboard.vue # 仪表盘
│   │   │   ├── Items.vue     # 物品管理
│   │   │   ├── Locations.vue # 地点管理
│   │   │   ├── Drawers.vue   # 抽屉管理
│   │   │   ├── Categories.vue # 类目管理
│   │   │   ├── Users.vue     # 用户管理
│   │   │   ├── Settings.vue  # 系统设置
│   │   │   └── QRScanner.vue # 二维码扫描
│   │   ├── stores/       # Pinia状态管理
│   │   │   └── auth.ts   # 认证状态管理
│   │   ├── router/       # Vue Router配置
│   │   │   └── index.ts  # 路由配置
│   │   ├── utils/        # 工具函数
│   │   │   └── crypto.ts # 前端加密工具
│   │   ├── App.vue       # 根组件
│   │   ├── main.ts       # 应用入口
│   │   └── style.css     # 全局样式
│   ├── public/           # 静态资源
│   ├── package.json
│   ├── vite.config.ts    # Vite配置
│   ├── tailwind.config.js # Tailwind CSS配置
│   └── .env              # 环境变量配置
│
├── docs/                 # 项目文档
│   ├── QUICKSTART.md     # 快速开始指南
│   ├── COMPLETED_FEATURES.md # 功能实现列表
│   ├── SECURITY_AND_NETWORK.md # 安全配置说明
│   └── FRONTEND_GUIDE.md # 前端开发指南
│
└── README.md             # 项目说明文档
```

## 🚀 快速开始

### 🔧 环境要求
- **Node.js** 18.0.0 或更高版本
- **npm** 或 **yarn** 包管理器
- **Git**（用于版本控制）

### 📦 安装依赖

```bash
# 克隆项目（如果需要）
git clone <项目地址>
cd family-object-manager

# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../frontend
pnpm install
```

### ⚙️ 环境配置

#### 后端配置
在 `backend/` 目录下创建 `.env` 文件：
```env
# 服务端口
PORT=3000

# JWT密钥（生产环境请使用复杂密钥）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 运行环境
NODE_ENV=development

# 数据库文件路径（可选，默认为 ./database.sqlite）
DATABASE_PATH=./database.sqlite
```

#### 前端配置
在 `frontend/` 目录下创建 `.env` 文件：
```env
# 后端API地址
VITE_API_URL=http://localhost:3000/api

# 应用标题（可选）
VITE_APP_TITLE=家庭物资管理系统
```

### 🎯 启动服务

#### 开发模式
```bash
# 1. 启动后端服务（在 backend 目录）
cd backend
pnpm run dev

# 2. 启动前端服务（在 frontend 目录，新开终端窗口）
cd frontend
pnpm run dev
```

#### 生产模式
```bash
# 构建后端
cd backend
pnpm run build
pnpm start

# 构建前端
cd frontend
pnpm run build
pnpm run preview
```

**访问地址：**
- 前端应用：http://localhost:5173
- 后端API：http://localhost:3000/api
- 健康检查：http://localhost:3000/health

### 🎉 首次使用

1. **访问前端页面**：http://localhost:5173
2. **注册管理员账号**：点击"立即注册"创建第一个用户（自动获得管理员权限）
3. **登录系统**：使用刚注册的账号登录
4. **查看过期提醒**：登录后如有过期物品会自动弹窗提醒
5. **开始使用**：添加地点、类目、抽屉和物品

## 📚 功能详解

### 🏷️ 二级分类系统
- **大类**：12个预设大类（食品🍎、调味品🧂、干货🌾等）
- **子类目**：200+常用物品分类（大米、洗发水、螺丝刀等）
- **智能搜索**：支持类目名称模糊搜索
- **自定义扩展**：支持添加新的大类和子类目

### 🗂️ 抽屉管理系统
- **二维码标识**：每个抽屉生成唯一二维码
- **快速定位**：扫描二维码直接跳转抽屉详情页
- **物品关联**：抽屉与物品的多对多关联关系
- **标签打印**：支持二维码标签批量打印

### ⏰ 智能过期管理
- **到期提醒**：登录时自动检测并提醒即将过期物品
- **过期分类**：区分"即将过期"和"已过期"物品
- **自定义阈值**：可配置提前多少天开始提醒

### 👨‍💼 权限管理
- **角色系统**：管理员/普通用户两级权限
- **功能权限**：
  - 管理员：所有功能 + 用户管理 + 系统设置
  - 普通用户：物品管理 + 查看功能
- **注册控制**：管理员可关闭游客注册功能

## 🔌 API接口文档

### 认证相关

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| POST | `/api/users/register` | 用户注册 | 公开 |
| POST | `/api/users/login` | 用户登录 | 公开 |
| GET | `/api/users/me` | 获取当前用户信息 | 登录用户 |
| GET | `/api/users` | 获取所有用户列表 | 管理员 |
| PUT | `/api/users/:id/password` | 修改用户密码 | 管理员 |
| DELETE | `/api/users/:id` | 删除用户 | 管理员 |

### 地点管理

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| GET | `/api/locations` | 获取所有地点 | 登录用户 |
| GET | `/api/locations/:id` | 获取地点详情 | 登录用户 |
| POST | `/api/locations` | 创建地点 | 登录用户 |
| PUT | `/api/locations/:id` | 更新地点信息 | 登录用户 |
| DELETE | `/api/locations/:id` | 删除地点 | 管理员 |

### 类目管理

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| GET | `/api/categories/groups` | 获取所有大类 | 登录用户 |
| GET | `/api/categories/items` | 获取所有物品类目 | 登录用户 |
| GET | `/api/categories/items/search` | 搜索物品类目 | 登录用户 |
| POST | `/api/categories/groups` | 创建大类 | 管理员 |
| POST | `/api/categories/items` | 创建物品类目 | 登录用户 |
| PUT | `/api/categories/groups/:id` | 更新大类 | 管理员 |
| DELETE | `/api/categories/groups/:id` | 删除大类 | 管理员 |

### 抽屉管理

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| GET | `/api/drawers` | 获取所有抽屉 | 登录用户 |
| GET | `/api/drawers/:id` | 获取抽屉详情 | 登录用户 |
| GET | `/api/drawers/qr/:qrCode` | 通过二维码获取抽屉 | 登录用户 |
| POST | `/api/drawers` | 创建抽屉 | 登录用户 |
| PUT | `/api/drawers/:id` | 更新抽屉信息 | 登录用户 |
| DELETE | `/api/drawers/:id` | 删除抽屉 | 管理员 |
| POST | `/api/drawers/:id/regenerate-qr` | 重新生成二维码 | 登录用户 |

### 物品管理

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| GET | `/api/items` | 获取所有物品 | 登录用户 |
| GET | `/api/items/:id` | 获取物品详情 | 登录用户 |
| GET | `/api/items/expiring` | 获取即将过期物品 | 登录用户 |
| GET | `/api/items/expired` | 获取已过期物品 | 登录用户 |
| POST | `/api/items` | 创建物品 | 登录用户 |
| PUT | `/api/items/:id` | 更新物品信息 | 登录用户 |
| DELETE | `/api/items/:id` | 删除物品 | 登录用户 |

### 系统设置

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| GET | `/api/settings` | 获取系统设置 | 管理员 |
| PUT | `/api/settings` | 更新系统设置 | 管理员 |

### 文件上传

| 方法 | 路径 | 描述 | 权限要求 |
|------|------|------|----------|
| POST | `/api/upload/image` | 上传图片文件 | 登录用户 |

## 🔐 安全特性

### 数据安全
- **密码加密**：使用bcryptjs对用户密码进行哈希存储
- **前端加密传输**：登录时密码经客户端AES加密后传输
- **JWT认证**：无状态认证机制，token自动过期
- **权限验证**：前后端双重权限验证

### 网络安全
- **CORS配置**：跨域资源共享控制
- **输入验证**：API参数严格验证和过滤
- **SQL注入防护**：使用参数化查询防止SQL注入
- **文件上传安全**：文件类型和大小限制

## 🚀 部署说明

### 开发环境
当前配置适用于本地开发和局域网访问：
- HTTP协议（适合内网使用）
- SQLite数据库（无需额外配置）
- 自动创建管理员账号

### 生产环境建议
部署到生产环境时，请注意以下安全配置：

1. **使用HTTPS协议**（必须）
2. **修改JWT密钥**为复杂随机字符串
3. **设置强密码策略**
4. **配置反向代理**（Nginx/Apache）
5. **启用防火墙**限制访问端口
6. **定期备份数据库文件**

#### Docker部署示例

创建 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-production-secret-key
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 📱 移动端支持

项目采用响应式设计，完美支持移动设备：
- **自适应布局**：Tailwind CSS响应式设计
- **触摸友好**：针对触摸操作优化的界面
- **二维码扫描**：支持手机摄像头扫描二维码
- **PWA就绪**：可添加到主屏幕，离线缓存

## 🛠️ 二次开发指南

### 添加新功能模块

1. **后端开发**：
```bash
# 1. 创建新的路由文件
touch backend/src/routes/newModule.ts

# 2. 创建数据库迁移（如需要）
# 在 database.ts 中添加新表结构

# 3. 在 index.ts 中注册路由
app.use('/api/newModule', newModuleRouter);
```

2. **前端开发**：
```bash
# 1. 创建新页面组件
touch frontend/src/views/NewModule.vue

# 2. 添加API服务
# 在 src/api/modules.ts 中添加新的API方法

# 3. 配置路由
# 在 src/router/index.ts 中添加新路由
```

### 扩展数据库
项目使用SQLite，修改数据库结构：

```typescript
// backend/src/database.ts
export const initDatabase = () => {
  // 添加新表
  db.exec(`
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
```

### 自定义主题
修改Tailwind CSS配置：

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-secondary-color'
      }
    }
  }
}
```

### API扩展
按照RESTful规范添加新的API端点：

```typescript
// 示例：添加新的统计API
app.get('/api/stats/overview', authenticate, (req, res) => {
  // 实现统计逻辑
  res.json({ data: stats });
});
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork项目**到你的GitHub账号
2. **创建特性分支**：`git checkout -b feature/AmazingFeature`
3. **提交更改**：`git commit -m 'Add some AmazingFeature'`
4. **推送分支**：`git push origin feature/AmazingFeature`  
5. **提交Pull Request**

### 代码规范
- **TypeScript**：使用严格类型检查
- **ESLint**：遵循代码风格规范  
- **提交规范**：使用语义化提交信息
- **测试覆盖**：新功能需要包含单元测试

## 📄 许可证

本项目基于 **MIT License** 开源许可证发布。

```
MIT License

Copyright (c) 2024 wibecoding

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 致谢

感谢以下开源项目的支持：
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Express.js](https://expressjs.com/) - Node.js Web应用框架
- [SQLite](https://www.sqlite.org/) - 轻量级数据库引擎
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

## 📞 联系方式

**项目作者：** wibecoding  
**GitHub：** [项目仓库地址]  
**问题反馈：** [Issues页面]

---

## 📋 更新日志

### v1.0.0 (2024-02)
- ✅ 完整的用户认证系统
- ✅ 物品管理CRUD功能
- ✅ 二级分类系统（12大类+200+子类）
- ✅ 抽屉管理与二维码功能
- ✅ 智能过期提醒系统
- ✅ 响应式用户界面
- ✅ 权限管理系统
- ✅ 图片上传功能
- ✅ 系统设置管理

### 未来规划
- 📊 数据统计和图表展示
- 📱 移动端APP开发
- 🔔 微信/邮件提醒通知
- 📦 批量导入/导出功能
- 🏷️ 智能标签系统
- 🔍 全文搜索功能

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**
- 扫描二维码快速访问抽屉内容

### 5. 地点和类目
- 灵活的地点管理（如：客厅、卧室、储藏室等）
- 物品分类管理（如：食品、药品、文具等）
- 支持自定义添加

## 数据库结构

### users (用户表)
- id: 主键
- username: 用户名（唯一）
- password: 密码（加密）
- email: 邮箱
- created_at: 创建时间

### locations (地点表)
- id: 主键
- name: 地点名称
- description: 描述
- created_by: 创建者ID
- created_at: 创建时间

### categories (类目表)
- id: 主键
- name: 类目名称
- description: 描述
- created_at: 创建时间

### drawers (抽屉表)
- id: 主键
- name: 抽屉名称
- description: 描述
- qr_code: 二维码标识（唯一）
- location_id: 地点ID
- parent_id: 父抽屉ID（支持嵌套）
- created_by: 创建者ID
- created_at: 创建时间

### items (物品表)
- id: 主键
- name: 物品名称
- description: 描述
- category_id: 类目ID
- location_id: 地点ID
- drawer_id: 抽屉ID
- purchase_date: 购买日期
- purchase_price: 购买价格
- expiry_date: 到期日期
- quantity: 数量
- created_by: 创建者ID
- created_at: 创建时间
- updated_at: 更新时间

## 生产部署

### 后端构建

```bash
cd backend
pnpm run build
pnpm start
```

### 前端构建

```bash
cd frontend
pnpm run build
```

构建产物在 `frontend/dist` 目录，可以部署到任何静态服务器。

### 环境变量

生产环境需要修改以下配置：

后端 `.env`:
```env
PORT=3000
JWT_SECRET=生成一个强密码
NODE_ENV=production
```

前端 `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
