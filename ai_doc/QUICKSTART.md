# 家庭物资管理系统 - 快速开始指南

## 项目已创建完成！

您的家庭物资管理系统已经完全搭建完成，包含以下功能：

### ✅ 已实现功能
1. **用户管理** - 注册、登录、JWT认证
2. **地点管理** - 管理物品存储地点
3. **类目管理** - 物品分类
4. **物品管理** - 完整CRUD，支持购买时间、价格、到期时间
5. **到期提醒** - 登录后自动弹窗提示
6. **抽屉系统** - 带二维码的文件夹式组织
7. **二维码功能** - 生成、打印、扫描

## 如何启动项目

### 1. 后端服务（已运行）
后端服务已经在运行：
- 地址: http://localhost:3000
- 数据库已初始化

### 2. 启动前端（新终端窗口）

打开新终端，运行：

```bash
cd /Volumes/Henry/code/family-object-manager/frontend
npm run dev
```

前端将运行在: http://localhost:5173

### 3. 首次使用

1. 访问 http://localhost:5173
2. 点击"立即注册"创建管理员账号
3. 登录系统
4. 查看到期物品提醒（如果有）
5. 开始添加地点、类目、抽屉和物品

## 项目结构

```
family-object-manager/
├── backend/          # 后端 (已运行在 localhost:3000)
│   ├── src/
│   │   ├── routes/   # API路由
│   │   ├── middleware/ # 认证中间件
│   │   ├── database.ts # SQLite数据库
│   │   └── index.ts  # 服务入口
│   └── database.sqlite # 数据库文件(自动生成)
│
├── frontend/         # 前端
│   ├── src/
│   │   ├── api/      # API服务
│   │   ├── components/ # 组件
│   │   ├── views/    # 页面
│   │   ├── stores/   # 状态管理
│   │   └── router/   # 路由
│   └── ...
```

## 功能使用指南

### 1. 用户管理
- 路径: `/users`
- 可查看所有用户、删除用户（不能删除自己）

### 2. 地点管理
- 路径: `/locations`
- 添加、编辑、删除存储地点

### 3. 类目管理
- 路径: `/categories`
- 添加、编辑、删除物品分类

### 4. 抽屉管理
- 路径: `/drawers`
- 创建抽屉时自动生成二维码
- 点击"查看二维码"可查看和打印
- 点击"查看详情"查看抽屉中的物品

### 5. 物品管理
- 路径: `/items`
- 添加物品，设置：
  - 名称、描述、数量
  - 类目、地点、抽屉
  - 购买日期、价格
  - 到期日期（重要！）
- 到期物品会在表格中高亮显示

### 6. 二维码功能
- 每个抽屉都有唯一二维码
- 可以打印贴在实际抽屉上
- 扫描后访问 `/qr/{qrCode}` 可查看抽屉内容

## API接口地址

- 健康检查: GET http://localhost:3000/health
- 用户注册: POST http://localhost:3000/api/users/register
- 用户登录: POST http://localhost:3000/api/users/login
- 其他接口详见 README.md

## 技术栈

### 后端
- Node.js + Express + TypeScript
- SQLite (better-sqlite3)
- JWT认证
- QRCode生成

### 前端
- Vue 3 + TypeScript + Vite
- Pinia状态管理
- Vue Router
- Tailwind CSS
- Axios

## 下一步

1. **启动前端**: 在新终端运行 `cd frontend && npm run dev`
2. **注册账号**: 访问 http://localhost:5173
3. **探索功能**: 尝试添加地点、类目、抽屉和物品
4. **测试到期提醒**: 添加一个已过期的物品，重新登录查看提醒

## 故障排查

### 后端问题
- 检查后端是否运行: `curl http://localhost:3000/health`
- 查看后端日志
- 确认 .env 文件已创建

### 前端问题
- 检查 VITE_API_URL 环境变量
- 清除浏览器缓存
- 检查浏览器控制台错误

## 生产部署

详见主 README.md 文件的"生产部署"章节。

---

**祝您使用愉快！** 🎉
