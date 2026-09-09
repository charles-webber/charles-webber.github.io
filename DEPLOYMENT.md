# Docker 部署

这个项目是 Hexo 静态博客。Docker 镜像会在构建阶段执行 `npm ci` 和
`npm run build`，运行阶段仅使用 Nginx 提供生成的 `public/` 文件。

## 在 VPS 上首次部署

安装 Docker Engine 和 Docker Compose plugin 后，运行：

```bash
git clone https://github.com/charles-webber/charles-webber.github.io.git /opt/mozhu-blog
cd /opt/mozhu-blog
docker compose up -d --build
```

默认监听 VPS 的 `8080` 端口，可通过 `http://<VPS-IP>:8080` 检查。若要
使用其他空闲端口：

```bash
BLOG_PORT=8081 docker compose up -d --build
```

生产域名应由现有的 1Panel/Nginx/Caddy 反向代理到 `127.0.0.1:8080`，并在
反向代理层配置 HTTPS；不要直接把容器的 80 端口暴露到公网上。

## 更新

```bash
cd /opt/mozhu-blog
git pull --ff-only origin master
docker compose up -d --build
docker image prune -f
```

## 检查与回滚

```bash
docker compose ps
docker compose logs --tail=100 blog
curl -f http://127.0.0.1:8080/healthz

# 回滚到上一个 Git 提交后重新构建
git checkout HEAD~1
docker compose up -d --build
```
