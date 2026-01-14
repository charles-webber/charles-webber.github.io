#!/bin/bash
# ================================================================
# FRP Server (frps) 一键部署脚本
# 用于在 VPS 上配置并启动 frps 服务
# ================================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

FRP_DIR="/home/frp"
CONFIG_FILE="$FRP_DIR/frps.toml"
SERVICE_FILE="/etc/systemd/system/frps.service"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   FRP Server 一键部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 检查 frps 二进制文件是否存在
if [ ! -f "$FRP_DIR/frps" ]; then
    echo -e "${RED}[Error] $FRP_DIR/frps 不存在！${NC}"
    echo "请先将 frps 二进制文件放到 $FRP_DIR 目录"
    exit 1
fi

# 2. 设置执行权限
echo -e "${BLUE}[1/5] 设置执行权限...${NC}"
chmod +x "$FRP_DIR/frps"

# 3. 检查配置文件
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}[Error] $CONFIG_FILE 不存在！${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] 配置文件已就绪${NC}"

# 4. 配置 systemd 服务
echo -e "${BLUE}[2/5] 配置 systemd 服务...${NC}"
if [ -f "$FRP_DIR/frps.service" ]; then
    sudo cp "$FRP_DIR/frps.service" "$SERVICE_FILE"
    sudo systemctl daemon-reload
    echo -e "${GREEN}[OK] systemd 服务已配置${NC}"
else
    echo -e "${RED}[Warn] frps.service 不存在，跳过 systemd 配置${NC}"
fi

# 5. 配置防火墙 (支持 ufw 和 firewalld)
echo -e "${BLUE}[3/5] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 7000/tcp 2>/dev/null || true
    sudo ufw allow 6000/tcp 2>/dev/null || true
    sudo ufw allow 7500/tcp 2>/dev/null || true
    echo -e "${GREEN}[OK] ufw 防火墙规则已添加${NC}"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=7000/tcp 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=6000/tcp 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=7500/tcp 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
    echo -e "${GREEN}[OK] firewalld 防火墙规则已添加${NC}"
else
    echo -e "${BLUE}[Info] 未检测到防火墙，跳过${NC}"
fi

# 6. 停止旧服务（如果存在）
echo -e "${BLUE}[4/5] 停止旧服务...${NC}"
sudo systemctl stop frps 2>/dev/null || true
pkill -f "frps" 2>/dev/null || true

# 7. 启动服务
echo -e "${BLUE}[5/5] 启动 frps 服务...${NC}"
if [ -f "$SERVICE_FILE" ]; then
    sudo systemctl enable frps
    sudo systemctl start frps
    sleep 2
    if sudo systemctl is-active --quiet frps; then
        echo -e "${GREEN}[OK] frps 服务已启动 (systemd)${NC}"
    else
        echo -e "${RED}[Error] 服务启动失败，查看日志: journalctl -u frps${NC}"
        exit 1
    fi
else
    # 无 systemd 时使用 nohup
    cd "$FRP_DIR"
    nohup ./frps -c ./frps.toml > frps.log 2>&1 &
    sleep 2
    if pgrep -f "frps" > /dev/null; then
        echo -e "${GREEN}[OK] frps 已后台启动 (nohup)${NC}"
    else
        echo -e "${RED}[Error] 启动失败，请检查 $FRP_DIR/frps.log${NC}"
        exit 1
    fi
fi

# 8. 显示状态
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "FRP 控制端口: ${BLUE}7000${NC}"
echo -e "博客访问端口: ${BLUE}6000${NC}"
echo -e "Dashboard:    ${BLUE}http://$(hostname -I | awk '{print $1}'):7500${NC}"
echo ""
