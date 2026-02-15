# Docker 快速启动

部署文件已整理到 `docker/` 目录。

## 快速开始

```bash
cd docker
./deploy.sh
```

## 主要变化

1. **目录结构**
   - 所有 Docker 相关文件移至 `docker/` 目录
   - 数据存储在 `data/` 目录

2. **端口配置支持**
   - 支持自定义主机端口（HOST_PORT）
   - 支持自定义容器端口（CONTAINER_PORT）
   - 通过 `.env` 文件配置

3. **配置文件**
   - `docker/.env.example` - 配置示例
   - `docker/.env` - 实际配置（部署时生成）

## 详细文档

查看 `docker/README.md` 了解完整文档。
