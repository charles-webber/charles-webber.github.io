#!/usr/bin/env bash
# Install the Git-polling deployment timer for this repository.
set -Eeuo pipefail

readonly REPOSITORY='https://github.com/charles-webber/charles-webber.github.io.git'
readonly BRANCH='master'
readonly BLOG_DIR='/opt/mozhu-blog'
readonly RAW_BASE='https://raw.githubusercontent.com/charles-webber/charles-webber.github.io/master/deploy/vps'

if [[ "${EUID}" -ne 0 ]]; then
  echo '请使用 root 或 sudo 运行此脚本。' >&2
  exit 1
fi

for command in git docker curl; do
  command -v "$command" >/dev/null 2>&1 || {
    echo "缺少 $command。请先安装 Git、Docker Engine（含 Compose plugin）和 curl 后重试。" >&2
    exit 1
  }
done

docker compose version >/dev/null 2>&1 || {
  echo '未找到 Docker Compose plugin。请安装后重试。' >&2
  exit 1
}

install -d -m 0755 /usr/local/sbin /etc/systemd/system
curl -fsSL "$RAW_BASE/mozhu-blog-auto-deploy" -o /usr/local/sbin/mozhu-blog-auto-deploy
curl -fsSL "$RAW_BASE/mozhu-blog-auto-deploy.service" -o /etc/systemd/system/mozhu-blog-auto-deploy.service
curl -fsSL "$RAW_BASE/mozhu-blog-auto-deploy.timer" -o /etc/systemd/system/mozhu-blog-auto-deploy.timer
chmod 0755 /usr/local/sbin/mozhu-blog-auto-deploy

if [[ ! -f /etc/mozhu-blog-deploy.env ]]; then
  printf 'BLOG_DIR=%s\nBLOG_REPO=%s\nBLOG_BRANCH=%s\n' "$BLOG_DIR" "$REPOSITORY" "$BRANCH" > /etc/mozhu-blog-deploy.env
  chmod 0644 /etc/mozhu-blog-deploy.env
fi

systemctl daemon-reload
systemctl enable --now mozhu-blog-auto-deploy.timer
systemctl start mozhu-blog-auto-deploy.service
systemctl --no-pager status mozhu-blog-auto-deploy.timer

echo
echo '自动部署已启用：每分钟检查一次 Git；有新提交时才会重新构建容器。'
echo '日志：journalctl -u mozhu-blog-auto-deploy.service -f'
