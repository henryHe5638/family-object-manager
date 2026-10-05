# 🏠 家庭物资管理系统 Family Object Manager

<div align="center">

**🤖 完全由 AI 编程工具开发的现代化全栈管理系统 🤖**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vue.js&logoColor=4FC08D)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

**🌈 VibeCoding 形式开发 | 🚀 开源免费 | 🔧 支持任意二次开发**

</div>

---

## 💡 项目说明

> **🤖 AI First Development**: 本项目完全使用 AI 编程工具（GitHub Copilot、Claude等）以 VibeCoding 氛围编程 形式耗时一天开发。

## 🚀 功能一览

### 📦 物品管理
- ✅ **完整CRUD操作** - 添加、查看、编辑、删除物品
- ✅ **二级分类体系** - 12个大类 + 200+精细子类目
- ✅ **时间轴管理** - 购买时间、到期时间跟踪
- ✅ **智能提醒** - 登录后自动弹窗提示过期物品
- ✅ **价格统计** - 支持价格记录和成本分析
- ✅ **库存管理** - 数量追踪和库存预警

### 🏠 地点管理
- ✅ **层级化地点** - 房间、区域、具体位置的多层级管理
- ✅ **智能关联** - 物品与地点的自动关联和统计
- ✅ **可视化界面** - 直观的地点选择器和管理面板

### 📁 抽屉系统
- ✅ **文件夹式组织** - 类似电脑文件系统的物品整理方式
- ✅ **二维码集成** - 每个抽屉生成唯一二维码标识
- ✅ **扫码查看** - 手机扫码即可查看抽屉详情和物品清单
- ✅ **标签打印** - 支持二维码标签批量打印功能

### 👥 用户体系
- ✅ **双角色系统** - 管理员/普通用户权限分离
- ✅ **首用户管理** - 首位注册用户自动获得管理员权限
- ✅ **权限粒度控制** - 功能级别的细粒度权限管理
- ✅ **注册控制** - 可配置开放/关闭用户注册

## 🛠️ 技术栈

### 后端 Backend
```javascript
// 现代化 Node.js 技术栈
- Node.js + Express + TypeScript
- SQLite (better-sqlite3) - 轻量级数据库
- JWT - 身份认证
- bcryptjs - 密码加密
- qrcode - 二维码生成
- multer - 文件上传
```

### 前端 Frontend  
```javascript
// Vue 3 生态系统
- Vue 3 + Composition API + TypeScript
- Vite - 极速开发构建工具
- Tailwind CSS - 原子化CSS框架
- Vue Router - 单页应用路由
- Pinia - 状态管理
- Axios - HTTP客户端
```

### 开发工具 DevTools
```bash
# AI 编程工具链
- GitHub Copilot - AI 代码补全
- Claude/ChatGPT - 架构设计和问题解决
- TypeScript - 类型安全
- ESLint + Prettier - 代码规范
- Git - 版本控制
```

## 🚀 快速开始

### 📋 环境要求
- Node.js 18+ 
- npm 或 yarn
- 现代浏览器（支持ES2020+）

### ⚡ 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/family-object-manager.git
cd family-object-manager

# 2. 安装后端依赖并启动
cd backend
pnpm install
pnpm run dev  # 后端服务: http://localhost:3000

# 3. 新终端窗口，启动前端
cd ../frontend  
pnpm install
pnpm run dev  # 前端服务: http://localhost:5173
```

### 🎉 首次使用

1. 访问 **http://localhost:5173**
2. 点击 **"立即注册"** 创建管理员账号（首位用户自动成为管理员）
3. 登录系统，开始使用！
4. 查看内置的分类数据和示例物品
5. 创建地点 → 添加抽屉 → 管理物品 → 打印二维码

## 📁 项目结构

```
family-object-manager/
├── 📁 backend/                 # 后端服务
│   ├── 📁 src/
│   │   ├── 📄 index.ts         # 应用入口
│   │   ├── 📄 database.ts      # 数据库配置
│   │   ├── 📁 routes/          # API 路由
│   │   │   ├── 📄 users.ts     # 用户管理
│   │   │   ├── 📄 items.ts     # 物品管理  
│   │   │   ├── 📄 locations.ts # 地点管理
│   │   │   ├── 📄 drawers.ts   # 抽屉管理
│   │   │   ├── 📄 categories.ts# 分类管理
│   │   │   └── 📄 settings.ts  # 系统设置
│   │   ├── 📁 middleware/      # 中间件
│   │   │   ├── 📄 auth.ts      # 认证中间件
│   │   │   └── 📄 adminCheck.ts# 管理员检查
│   │   └── 📁 utils/           # 工具函数
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
│
├── 📁 frontend/                # 前端应用
│   ├── 📁 src/
│   │   ├── 📄 App.vue          # 根组件
│   │   ├── 📄 main.ts          # 应用入口
│   │   ├── 📁 views/           # 页面组件
│   │   │   ├── 📄 Dashboard.vue    # 仪表板
│   │   │   ├── 📄 Items.vue        # 物品管理
│   │   │   ├── 📄 Locations.vue    # 地点管理
│   │   │   ├── 📄 Drawers.vue      # 抽屉管理
│   │   │   ├── 📄 Categories.vue   # 分类管理
│   │   │   └── 📄 Settings.vue     # 系统设置
│   │   ├── 📁 components/      # 组件库
│   │   │   ├── 📄 Layout.vue       # 布局组件
│   │   │   ├── 📄 QRCodeDisplay.vue# 二维码显示
│   │   │   └── 📄 ExpiryModal.vue  # 过期提醒
│   │   ├── 📁 api/             # API 服务
│   │   ├── 📁 stores/          # 状态管理
│   │   └── 📁 router/          # 路由配置
│   ├── 📄 package.json
│   ├── 📄 vite.config.ts
│   └── 📄 tailwind.config.js
│
├── 📁 ai_doc/                  # AI开发文档
│   ├── 📄 COMPLETED_FEATURES.md
│   ├── 📄 IMPLEMENTATION_SUMMARY.md  
│   └── 📄 QUICKSTART.md
│
└── 📄 README.md                # 项目说明
```

## 🎨 界面预览

### 🎛️ 管理仪表板
- 📊 物品统计概览
- ⚠️ 过期物品提醒
- 📈 库存分析图表
- 🔍 快速搜索功能

### 📦 物品管理
- 🗂️ 表格化物品列表
- 🏷️ 智能分类筛选
- 📅 时间排序功能
- ✏️ 内联编辑支持

### 📱 二维码系统
- 🏷️ 自动生成唯一二维码
- 🖨️ 批量打印标签功能
- 📱 手机扫码查看详情
- 🔗 URL形式快速访问

## 🔧 二次开发指南
### 🛠️ 扩展开发

#### 添加新功能模块
```bash
# 1. 后端添加新路由
cd backend/src/routes
# 创建新的路由文件，参考现有文件结构

# 2. 前端添加新页面
cd frontend/src/views  
# 创建新的 Vue 组件，使用 Composition API

# 3. 添加 API 接口
cd frontend/src/api
# 在相应模块中添加新的 API 调用
```

#### 数据库扩展
```typescript
// backend/src/database.ts
// 参考现有表结构，添加新表或字段
db.exec(`
  CREATE TABLE IF NOT EXISTS your_new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    // ... 你的字段定义
  )
`);
```

#### 前端组件开发
```vue
<!-- 使用项目统一的风格 -->
<template>
  <!-- Tailwind CSS + 响应式布局 -->
</template>

<script setup lang="ts">
// Composition API + TypeScript
</script>
```

### 🎨 主题定制
- 📝 修改 `frontend/tailwind.config.js` 定制颜色主题
- 🎨 更新 `frontend/src/style.css` 调整全局样式
- 🖼️ 替换 `frontend/public/` 中的图标和Logo

### 🔌 API 扩展
- 📡 RESTful API 设计模式
- 🔐 JWT 中间件自动处理认证
- ✅ TypeScript 类型安全
- 📝 完整的错误处理机制

## 📚 API 文档

### 🔐 认证接口
```typescript
POST /api/users/register  // 用户注册
POST /api/users/login     // 用户登录
GET  /api/users/profile   // 获取用户信息
```

### 📦 物品管理
```typescript
GET    /api/items         // 获取物品列表
POST   /api/items         // 创建新物品
PUT    /api/items/:id     // 更新物品
DELETE /api/items/:id     // 删除物品
GET    /api/items/expiring // 获取即将过期物品
```

### 🏠 地点管理
```typescript  
GET    /api/locations     // 获取地点列表
POST   /api/locations     // 创建新地点
PUT    /api/locations/:id // 更新地点
DELETE /api/locations/:id // 删除地点 (管理员)
```

### 📁 抽屉管理
```typescript
GET    /api/drawers       // 获取抽屉列表  
POST   /api/drawers       // 创建新抽屉
PUT    /api/drawers/:id   // 更新抽屉
DELETE /api/drawers/:id   // 删除抽屉 (管理员)
GET    /api/drawers/:id/qr // 获取抽屉二维码
```

### 🏷️ 分类管理
```typescript
GET    /api/categories/groups    // 获取所有大类
GET    /api/categories/items     // 获取所有子类目
GET    /api/categories/items/search // 搜索类目
POST   /api/categories/groups    // 创建大类 (管理员)
POST   /api/categories/items     // 创建子类目
```

## 🙏 致谢

### 🤖 AI 开发工具
- **GitHub Copilot** - 优秀的代码补全和生成
- **Claude/ChatGPT** - 架构设计和问题解决
- **Various AI Tools** - 文档生成和代码优化

### 📚 开源技术
- Vue.js、Node.js、TypeScript 等优秀的开源技术
- 所有依赖的开源库和框架的贡献者们

### 🌟 社区支持  
- 开源社区的无私分享和技术支持
- 所有使用和反馈的用户们