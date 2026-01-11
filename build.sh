#!/bin/bash
# Hexo 自动构建与部署脚本

# 安全模式，遇到错误立即退出
set -e
# 安装依赖
echo "Current Directory: $(pwd)"
echo "Files in current directory:"
ls -F

npm install --loglevel error

# 生成静态文件
echo "Checking Hexo version..."
if [ -f "./node_modules/.bin/hexo" ]; then
    ./node_modules/.bin/hexo version
else
    echo "Local hexo not found, trying npx..."
    npx hexo version
fi

echo "Cleaning..."
./node_modules/.bin/hexo clean || npx hexo clean

echo "Generating..."
./node_modules/.bin/hexo generate || npx hexo generate

echo "Build complete. checking public folder:"
ls -d public || echo "public folder NOT FOUND"


# 部署到远程仓库 (在 Cloudflare 构建时不需要这行，已注释)
# npx hexo deploy