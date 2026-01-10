#!/bin/bash
# Hexo 自动构建与部署脚本

# 安全模式，遇到错误立即退出
set -e
# 生成静态文件
npx hexo clean
npx hexo generate
# 部署到远程仓库
npx hexo deploy