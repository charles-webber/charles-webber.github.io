# VPS Docker 部署

博客使用 Docker 构建 Hexo 静态站点，并由 Nginx 提供服务。自动部署通过 systemd timer 每分钟检查一次 GitHub 的 `master` 分支；发现新提交时才拉取、构建并重启容器。

## 一键安装自动部署

先在 VPS 安装并启动 Docker Engine（含 Docker Compose plugin）、Git 和 curl，然后以有 sudo 权限的用户运行：

```bash
curl -fsSL https://raw.githubusercontent.com/charles-webber/charles-webber.github.io/master/deploy/vps/install-auto-deploy.sh | sudo bash
```

脚本会完成首次克隆到 `/opt/mozhu-blog`、首次构建，并启用 `mozhu-blog-auto-deploy.timer`。之后本机推送到 GitHub 后，VPS 会在约一分钟内自动部署。

默认博客监听 VPS 的 `8080` 端口。生产域名应由现有 Nginx、Caddy 或 1Panel 反向代理到 `127.0.0.1:8080`，并在反向代理层配置 HTTPS。

## 检查状态与日志

```bash
systemctl status mozhu-blog-auto-deploy.timer
journalctl -u mozhu-blog-auto-deploy.service -f
cd /opt/mozhu-blog && docker compose ps
curl -f http://127.0.0.1:8080/healthz
```

## 注意事项

`/opt/mozhu-blog` 是可再生的部署副本。自动部署发现新提交时会用远程提交覆盖其中受 Git 管理的文件，因此不要直接修改这个目录里的代码；所有改动都应在本机提交并推送。

如需修改仓库地址、分支或目录，编辑 VPS 上的 `/etc/mozhu-blog-deploy.env` 后运行：

```bash
sudo systemctl restart mozhu-blog-auto-deploy.timer
sudo systemctl start mozhu-blog-auto-deploy.service
```
