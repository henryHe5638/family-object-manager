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
mkdir -p ./data
touch ./data/database.sqlite
echo "✅ 数据目录创建完成"
echo ""

# 询问用户是否修改配置
read -p "是否需要修改默认配置？(y/N): " modify_config

if [[ $modify_config =~ ^[Yy]$ ]]; then
    echo ""
    echo "请输入配置信息（直接回车使用默认值）："
    echo ""
    
    # 端口配置
    read -p "主机端口 [3000]: " host_port
    host_port=${host_port:-3000}
    
    read -p "容器端口 [3000]: " container_port
    container_port=${container_port:-3000}
    
    # 管理员配置
    read -p "管理员用户名 [admin]: " admin_username
    admin_username=${admin_username:-admin}
    
    read -s -p "管理员密码 [admin123]: " admin_password
    echo ""
    admin_password=${admin_password:-admin123}
    
    read -p "管理员邮箱 [留空]: " admin_email
    
    # 网站配置
    read -p "网站地址 [http://localhost:$host_port]: " site_url
    site_url=${site_url:-http://localhost:$host_port}
    
    read -p "允许访客注册 [true]: " allow_register
    allow_register=${allow_register:-true}
    
    # JWT 密钥
    read -p "JWT 密钥 [自动生成]: " jwt_secret
    if [ -z "$jwt_secret" ]; then
        jwt_secret=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    fi
    
    # 生成 .env 文件
    echo ""
    echo "📝 生成配置文件..."
    cat > .env << EOF
# 端口配置
HOST_PORT=$host_port
CONTAINER_PORT=$container_port

# 管理员账户
ADMIN_USERNAME=$admin_username
ADMIN_PASSWORD=$admin_password
ADMIN_EMAIL=$admin_email

# 网站配置
SITE_URL=$site_url
ALLOW_GUEST_REGISTER=$allow_register

# JWT 密钥
JWT_SECRET=$jwt_secret
EOF
    echo "✅ 配置文件生成完成: .env"
    echo ""
else
    # 使用默认配置
    echo "使用默认配置..."
    cat > .env << EOF
# 端口配置
HOST_PORT=3000
CONTAINER_PORT=3000

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@example.com

# 网站配置
SITE_URL=http://localhost:3000
ALLOW_GUEST_REGISTER=true

# JWT 密钥（请在生产环境修改）
JWT_SECRET=your-secret-key-change-this-in-production
EOF
    echo "✅ 使用默认配置"
    echo ""
fi

# 显示配置信息
echo "=========================================="
echo "配置信息："
echo "=========================================="
echo "主机端口: $(grep HOST_PORT .env | cut -d'=' -f2)"
echo "容器端口: $(grep CONTAINER_PORT .env | cut -d'=' -f2)"
echo "管理员用户名: $(grep ADMIN_USERNAME .env | cut -d'=' -f2)"
echo "网站地址: $(grep SITE_URL .env | cut -d'=' -f2)"
echo "=========================================="
echo ""

# 询问是否继续
read -p "是否开始部署？(Y/n): " confirm_deploy

if [[ $confirm_deploy =~ ^[Nn]$ ]]; then
    echo "❌ 取消部署"
    exit 0
fi

echo ""
echo "🚀 开始部署..."
echo ""

# 停止旧容器
echo "📦 停止旧容器..."
docker-compose down 2>/dev/null || true
echo "✅ 旧容器已停止"
echo ""

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache
echo "✅ 镜像构建完成"
echo ""

# 启动容器
echo "🎉 启动容器..."
docker-compose up -d
echo "✅ 容器启动完成"
echo ""

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查容器状态
if docker ps | grep -q "family-object-manager"; then
    echo "✅ 容器运行正常"
    echo ""
    echo "=========================================="
    echo "🎉 部署完成！"
    echo "=========================================="
    echo ""
    echo "访问地址: $(grep SITE_URL .env | cut -d'=' -f2)"
    echo "管理员账户: $(grep ADMIN_USERNAME .env | cut -d'=' -f2)"
    echo "初始密码: $(grep ADMIN_PASSWORD .env | cut -d'=' -f2)"
    echo ""
    echo "常用命令："
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo "  查看状态: docker-compose ps"
    echo ""
    echo "数据备份位置: ./data/"
    echo "=========================================="
else
    echo "❌ 容器启动失败，请查看日志："
    echo "  docker-compose logs"
    exit 1
fi
