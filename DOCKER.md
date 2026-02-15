# 家庭物资管理系统 - Docker 部署指南

## 快速开始

### 1. 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd family-object-manager

# 创建数据目录
mkdir -p data

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问地址：http://localhost:3000

默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

### 2. 使用 Docker 构建

```bash
# 构建镜像
docker build -t family-object-manager .

# 运行容器
docker run -d \
  --name family-manager \
  -p 3000:3000 \
  -v $(pwd)/data/database.sqlite:/app/database.sqlite \
  -v $(pwd)/data/uploads:/app/uploads \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin123 \
  -e SITE_URL=http://localhost:3000 \
  family-object-manager

# 查看日志
docker logs -f family-manager

# 停止容器
docker stop family-manager

# 删除容器
docker rm family-manager
```

## 环境变量配置

在 `docker-compose.yml` 中可以配置以下环境变量：

### 服务器配置
- `NODE_ENV`: 运行环境（默认: production）
- `PORT`: 服务端口（默认: 3000）

### 初始管理员配置
- `ADMIN_USERNAME`: 初始管理员用户名（默认: admin）
- `ADMIN_PASSWORD`: 初始管理员密码（默认: admin123）
- `ADMIN_EMAIL`: 初始管理员邮箱（默认: 空）

### 网站配置
- `SITE_URL`: 网站地址，用于生成二维码（默认: http://localhost:3000）
- `ALLOW_GUEST_REGISTER`: 是否允许游客注册（默认: true）

### 安全配置
- `JWT_SECRET`: JWT 密钥（**生产环境必须修改**）

## 数据持久化

数据通过 Docker 卷映射到宿主机 `./data` 目录：

- `./data/database.sqlite`: 数据库文件
- `./data/uploads`: 上传的图片文件

**备份建议**: 定期备份 `./data` 目录

## 生产环境部署建议

### 1. 修改默认配置

编辑 `docker-compose.yml`：

```yaml
environment:
  # 修改管理员密码
  - ADMIN_PASSWORD=your-strong-password
  
  # 修改网站地址为实际域名
  - SITE_URL=https://yourdomain.com
  
  # 修改 JWT 密钥为随机字符串
  - JWT_SECRET=your-random-secret-key-at-least-32-chars
  
  # 生产环境建议关闭游客注册
  - ALLOW_GUEST_REGISTER=false
```

### 2. 使用反向代理

推荐使用 Nginx 或 Traefik 作为反向代理，配置 HTTPS：

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 添加到 docker-compose.yml（使用 Nginx）

```yaml
version: '3.8'

services:
  family-manager:
    # ... 原配置 ...
    expose:
      - "3000"
    networks:
      - family-manager-network

  nginx:
    image: nginx:alpine
    container_name: family-manager-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - family-manager
    networks:
      - family-manager-network

networks:
  family-manager-network:
    driver: bridge
```

## 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build

# 或使用 Docker
docker build -t family-object-manager .
docker stop family-manager
docker rm family-manager
docker run -d \
  --name family-manager \
  -p 3000:3000 \
  -v $(pwd)/data/database.sqlite:/app/database.sqlite \
  -v $(pwd)/data/uploads:/app/uploads \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e SITE_URL=http://localhost:3000 \
  family-object-manager
```

## 故障排查

### 查看日志
```bash
docker-compose logs -f
```

### 进入容器
```bash
docker-compose exec family-manager sh
```

### 检查健康状态
```bash
docker-compose ps
curl http://localhost:3000/health
```

### 重启服务
```bash
docker-compose restart
```

## 数据迁移

### 导出数据
```bash
# 在设置页面使用"导出数据库"功能
# 或直接复制数据库文件
cp data/database.sqlite backup/database-$(date +%Y%m%d).sqlite
```

### 导入数据
```bash
# 停止服务
docker-compose down

# 替换数据库文件
cp backup/database-20260215.sqlite data/database.sqlite

# 启动服务
docker-compose up -d
```

## 性能优化

### 限制容器资源

在 `docker-compose.yml` 中添加：

```yaml
services:
  family-manager:
    # ... 原配置 ...
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 安全建议

1. **修改默认密码**: 首次登录后立即修改管理员密码
2. **定期备份**: 设置自动备份数据库和上传文件
3. **使用 HTTPS**: 生产环境必须使用 HTTPS
4. **限制访问**: 使用防火墙限制访问来源
5. **更新镜像**: 定期更新基础镜像和依赖包

## 支持

如有问题，请查看项目文档或提交 Issue。
