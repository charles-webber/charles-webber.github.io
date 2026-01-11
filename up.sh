#!/bin/bash

# ----------------------------------------------------------------
# Hexo 博客一键上传脚本 (源码模式)
# 作用：将本地所有修改推送到 GitHub，触发 Cloudflare Pages 自动构建
# ----------------------------------------------------------------

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}开始准备上传博客源码...${NC}"

# 1. 检查是否有更改
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}没有任何更改需要上传。${NC}"
    exit 0
fi

# 2. 添加所有更改
git add -A

# 3. 询问提交信息（回车默认 "update blog"）
read -p "请输入本次更新的说明 (直接回车默认为 'update blog'): " msg
if [ -z "$msg" ]; then
    msg="update blog"
fi

# 4. 提交
git commit -m "$msg"

# 5. 推送到远程 master 分支
echo -e "${BLUE}正在推送到 GitHub...${NC}"
git push origin master

if [ $? -eq 0 ]; then
    echo -e "${GREEN}---------------------------------------${NC}"
    echo -e "${GREEN}上传成功！Cloudflare 大约在 1-2 分钟内完成更新。${NC}"
    echo -e "${GREEN}---------------------------------------${NC}"
else
    echo -e "\033[0;31m推送失败，请检查网络或是否存在冲突。${NC}"
fi

# 保持窗口开启（针对 Windows 环境）
read -p "按回车键退出..."
