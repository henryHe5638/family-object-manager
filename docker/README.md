# 家庭物资管理系统 - Docker 部署指南

## 快速开始

### 1. 进入 docker 目录
```bash
cd docker
```

### 2. 运行部署脚本
```bash
chmod +x deploy.sh
./deploy.sh
```

脚本会引导您配置：
- 主机端口（默认 3000）
- 容器端口（默认 3000）
- 管理员账户信息
- 网站地址
- JWT 密钥

### 3. 访问应用
部署完成后，访问 `http://localhost:3000`（或您配置的端口）

默认管理员账户：
- 用户名：admin
- 密码：admin123

## 端口配置

### 修改端口
编辑 `.env` 文件：
```env
HOST_PORT=8080        # 主机访问端口
CONTAINER_PORT=3000   # 容器内部端口（通常不需要修改）
```

### 使用不同端口示例

**示例1：使用 8080 端口**
```env
HOST_PORT=8080
CONTAINER_PORT=3000
SITE_URL=http://localhost:8080
```

**示例2：使用 80 端口（需要 sudo）**
```env
HOST_PORT=80
CONTAINER_PORT=3000
SITE_URL=http://yourdomain.com
```

**示例3：使用自定义容器端口**
```env
HOST_PORT=3000
CONTAINER_PORT=8000
SITE_URL=http://localhost:3000
```

## 手动部署

### 1. 复制环境变量文件
```bash
cp .env.example .env
```

### 2. 修改配置
编辑 `.env` 文件，修改端口和其他配置

### 3. 启动服务
```bash
docker-compose up -d
```

### 4. 查看日志
```bash
docker-compose logs -f
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps

# 重新构建镜像
docker-compose build --no-cache

# 进入容器
docker-compose exec family-manager sh
```

## 更新应用

### 方法1：使用部署脚本
```bash
./deploy.sh
```

### 方法2：手动更新
```bash
# 停止服务
docker-compose down

# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 数据备份

数据存储在 `../data/` 目录：
- `database.sqlite` - 数据库文件
- `uploads/` - 上传文件（新版本图片已存储在数据库中）

### 备份命令
```bash
# 备份数据库
cp ../data/database.sqlite ../data/database.sqlite.backup

# 完整备份
tar -czf backup-$(date +%Y%m%d).tar.gz ../data/
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| HOST_PORT | 主机访问端口 | 3000 |
| CONTAINER_PORT | 容器内部端口 | 3000 |
| ADMIN_USERNAME | 管理员用户名 | admin |
| ADMIN_PASSWORD | 管理员密码 | admin123 |
| ADMIN_EMAIL | 管理员邮箱 | admin@example.com |
| SITE_URL | 网站地址（用于二维码） | http://localhost:3000 |
| ALLOW_GUEST_REGISTER | 允许访客注册 | true |
| JWT_SECRET | JWT 密钥 | 随机生成 |

## 生产环境配置建议

1. **修改默认密码**
   ```env
   ADMIN_PASSWORD=你的强密码
   ```

2. **设置强 JWT 密钥**
   ```bash
   openssl rand -base64 32
   ```

3. **配置域名**
   ```env
   SITE_URL=https://yourdomain.com
   HOST_PORT=80  # 或 443
   ```

4. **禁用访客注册**（可选）
   ```env
   ALLOW_GUEST_REGISTER=false
   ```

5. **定期备份数据**
   ```bash
   # 添加到 crontab
   0 2 * * * tar -czf /backup/family-manager-$(date +\%Y\%m\%d).tar.gz /path/to/data/
   ```

## 使用 Nginx 反向代理

如果需要使用域名和 HTTPS，可以配置 Nginx：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 故障排查

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
lsof -i :3000

# 查看容器状态
docker ps -a
```

### 端口访问失败
1. 检查防火墙设置
2. 确认端口映射配置
3. 验证 SITE_URL 配置

### 数据库错误
```bash
# 检查数据库文件权限
ls -la ../data/database.sqlite

# 重置数据库（会丢失数据）
rm ../data/database.sqlite
docker-compose restart
```

## 目录结构

```
docker/
├── .dockerignore       # Docker 忽略文件
├── .env.example        # 环境变量示例
├── .env                # 环境变量配置（自动生成）
├── Dockerfile          # Docker 镜像定义
├── docker-compose.yml  # Docker Compose 配置
├── deploy.sh           # 快速部署脚本
└── README.md           # 本文档

./data/                # 数据目录（自动创建）
├── database.sqlite     # SQLite 数据库
└── uploads/            # 临时文件目录
```

## 技术支持

如有问题，请查看：
- [项目主 README](../README.md)
