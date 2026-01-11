# 自建 Meting API 服务端指南 (Azure Linux - Go 稳定版)

为了解决网易云音乐 VIP 歌曲播放受限（45秒）的问题，我们需要在您的服务器上部署支持注入 VIP Cookie 的 Meting API。

我已经为您准备好了所需的部署文件，位于 `meting-setup` 文件夹中。

## 步骤 1: 获取 VIP Cookie

1. 在浏览器中访问 [网易云音乐官网](https://music.163.com/) 并登录您的 VIP 账号。
2. 按 `F12` 打开开发者工具。
3. 切换到 `Application` (应用) 选项卡 (Chrome/Edge) 或 `Storage` (存储) 选项卡 (Firefox)。
4. 在左侧找到 `Cookies`，点击 `https://music.163.com`。
5. 在列表中找到名为 `MUSIC_U` 的 Cookie。
6. 复制它的**值 (Value)**。

## 步骤 2: 修改配置文件

1. 打开本地文件夹 `meting-setup` 中的 `docker-compose.yml` 文件。
2. 找到 `METING_API_COOKIE` 行。
3. 将 `YOUR_REAL_MUSIC_U_COOKIE_VALUE_HERE` 替换为您刚才复制的真实 Cookie 值。保存文件。
   *示例：`METING_API_COOKIE: "MUSIC_U=000FE88...;"`*

## 步骤 3: 上传并启动

1. 将 `docker-compose.yml` 上传到服务器（例如 `/opt/meting-setup/`）。
2. 在服务器上运行：
   ```bash
   cd /opt/meting-setup
   docker-compose down
   docker-compose pull
   docker-compose up -d
   ```

## 步骤 4: 更新博客配置

我已经为您修改了 `_config.yml`：

```yaml
aplayer:
  meting: true
  meting_api: 'http://20.239.25.118:8000/api?server=:server&type=:type&id=:id&r=:r'
```
