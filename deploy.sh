#!/bin/bash

# 家庭物资管理系统 - 快速部署脚本

set -e

echo "=========================================="
echo "家庭物资管理系统 - Docker 快速部署"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 和 Docker Compose 已安装"
echo ""

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data
echo "✅ 数据目录创建完成"
echo ""

# 询问用户是否修改配置
read -p "是否需要修改默认配置？(y/N): " modify_config

if [[ $modify_config =~ ^[Yy]$ ]]; then
    echo ""
    echo "请输入配置信息（直接回车使用默认值）："
    echo ""
    
    read -p "管理员用户名 [admin]: " admin_username
    admin_username=${admin_username:-admin}
    
    read -s -p "管理员密码 [admin123]: " admin_password
    echo ""
    admin_password=${admin_password:-admin123}
    
    read -p "管理员邮箱 [留空]: " admin_email
    
    read -p "网站地址 [http://localhost:3000]: " site_url
    site_url=${site_url:-http://localhost:3000}
    
    read -p "允许游客注册 [true]: " allow_register
    allow_register=${allow_register:-true}
    
    # 生成随机 JWT 密钥
    jwt_secret=$(openssl rand -base64 32 2>/dev/null || echo "change-this-secret-key-in-production")
    
    # 修改 docker-compose.yml
    echo ""
    echo "📝 更新配置文件..."
    
    cat > docker-compose.yml <<EOF
version: '3.8'

services:
  family-manager:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: family-object-manager
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ADMIN_USERNAME=${admin_username}
      - ADMIN_PASSWORD=${admin_password}
      - ADMIN_EMAIL=${admin_email}
      - SITE_URL=${site_url}
      - ALLOW_GUEST_REGISTER=${allow_register}
      - JWT_SECRET=${jwt_secret}
    volumes:
      - ./data/database.sqlite:/app/database.sqlite
      - ./data/uploads:/app/uploads
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - family-manager-network

networks:
  family-manager-network:
    driver: bridge
EOF
    
    echo "✅ 配置文件已更新"
fi

echo ""
echo "🚀 开始构建和启动服务..."
echo ""

# 构建并启动服务
docker-compose up -d --build

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "📍 访问地址: http://localhost:3000"
echo "👤 管理员用户名: ${admin_username:-admin}"
echo "🔑 管理员密码: ${admin_password:-admin123}"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  查看状态: docker-compose ps"
echo ""
echo "数据位置: ./data/"
echo "  - 数据库: ./data/database.sqlite"
echo "  - 上传文件: ./data/uploads/"
echo ""
echo "⚠️  首次登录后请及时修改管理员密码！"
echo "=========================================="
