# 多阶段构建 Dockerfile

# 阶段 1: 构建前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端依赖文件
COPY frontend/package*.json ./

# 安装前端依赖
RUN npm ci

# 复制前端源码
COPY frontend/ ./

# 构建前端
RUN npm run build

# 阶段 2: 构建后端
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# 复制后端依赖文件
COPY backend/package*.json ./

# 安装后端依赖
RUN npm ci

# 复制后端源码
COPY backend/ ./

# 构建后端 TypeScript
RUN npm run build

# 阶段 3: 生产镜像
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制编译后的后端代码
COPY --from=backend-builder /app/backend/dist ./dist

# 从构建阶段复制前端静态文件
COPY --from=frontend-builder /app/frontend/dist ./public

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
