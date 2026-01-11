#!/bin/bash
# Hexo 自动构建与部署脚本

# 安全模式，遇到错误立即退出
set -e
# 安装依赖
npm install --loglevel error

# 生成静态文件
echo "Checking Hexo version..."
./node_modules/.bin/hexo version

echo "Cleaning..."
./node_modules/.bin/hexo clean

echo "Generating..."
./node_modules/.bin/hexo generate

echo "Build complete."

# 部署到远程仓库 (在 Cloudflare 构建时不需要这行，已注释)
# npx hexo deploy