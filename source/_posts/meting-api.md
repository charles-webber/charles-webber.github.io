---
title: 解决 Hexo Aplayer 无法播放 VIP 音乐的问题：自建 Local Meting API
date: 2026-01-14 10:00:00
tags: [Hexo, Aplayer, Meting, Node.js, 教程]
categories: [技术分享, Hexo]
cover: https://images.wallpaperscraft.com/image/single/girl_headphones_anime_1012423_1920x1080.jpg
---

在使用 Hexo 搭建博客时，我们常常使用 Aplayer + MetingJS 来插入背景音乐。然而，由于版权保护和反爬策略，公共的 Meting API 往往无法解析 VIP 歌曲，导致博客上的歌单经常变灰或无法播放。

今天我终于解决了这个问题，通过**自建本地 Meting API** 并配合 **NeteaseCloudMusicApi** 和 **内网穿透**，完美实现了 VIP 歌曲的播放。

这里复盘一下这次 Debug 的过程，并整理成教程指导后人。





**可以看见这里的播放时长只有45s，这其实就是网易云会员音乐的试播时长**

![image-20260114103422236](https://gitee.com/Charles-Webber/blog-image1/raw/master/img/image-20260114103422236.png)

## 问题复盘

Aplayer 配合 MetingJS 的工作原理是：前端网页向 Meting API 发送请求（如 `GET /api?server=netease&type=url&id=xxx`），API 返回歌曲的真实 MP3 链接。

公共 API 失效的原因通常有两点：
1. **IP 限制**：API 服务器的 IP 被网易云拉黑。
2. **Cookie 缺失**：没有 VIP 账号的 Cookie，无法调用获取 VIP 歌曲链接的接口。

解决方案非常直观：**自己跑一个 API**。并在 API 请求中带上自己的 VIP Cookie，然后让 Hexo 博客去请求这个私有 API。

## 解决方案

我的方案架构如下：
1. **本地后端**：在本地运行一个 Node.js 服务，使用 `NeteaseCloudMusicApi` 库转发请求。
2. **内网穿透**：通过 FRP 或 Cloudflare Tunnel 将本地服务暴露到公网（如 `api.wenmozhu.de5.net`）。
3. **前端配置**：修改 Hexo 的 `_config.yml`，将 `meting_api` 指向我们自己的域名。

### 第一步：编写后端代码

在博客根目录下创建一个 `local-meting` 文件夹，这就是我们的 API 服务端。

**1. 初始化项目并安装依赖**

```bash
cd local-meting
npm init -y
npm install express cors NeteaseCloudMusicApi dotenv
```

**2. 编写 `app.js`**

这是核心代码，负责处理请求并注入 VIP Cookie。

```javascript
/* local-meting/app.js */
const express = require('express');
require('dotenv').config(); // 引入 dotenv
const { song_url, lyric, playlist_track_all, song_detail, playlist_detail } = require('NeteaseCloudMusicApi');
const cors = require('cors');
const app = express();
const port = 3000;

// ====== 配置区域 ======
// 从环境变量读取网易云 Cookie
const MY_COOKIE = process.env.METING_COOKIE || ''; 
// ====================

app.use(cors());

// 辅助函数：格式化返回结果，适配 MetingJS 格式
const createMetingResponse = (req, list) => {
    const { headers } = req;
    // 自动获取当前访问的域名（兼容穿透域名）
    const host = headers.host; 
    const baseUrl = `https://${host}/`;

    return list.map(item => {
        return {
            title: item.name,
            author: item.ar ? item.ar.map(a => a.name).join('/') : 'Unknown',
            // 构造递归链接，让前端再次请求本 API 获取具体资源
            url: `${baseUrl}?server=netease&type=url&id=${item.id}`,
            pic: `${baseUrl}?server=netease&type=pic&id=${item.id}`,
            lrc: `${baseUrl}?server=netease&type=lrc&id=${item.id}`
        };
    });
};

// 路由处理
const handleRequest = async (req, res) => {
    const { server, type, id } = req.query;

    if (server !== 'netease') return res.json({ error: 'Only netease is supported locally' });

    try {
        const commonConfig = { cookie: MY_COOKIE, realIP: '116.25.146.177' }; // 伪造国内 IP

        // 1. 获取歌单
        if (type === 'playlist') {
            const data = await playlist_detail({ id, ...commonConfig });
            // 处理歌单可能只返回 ID 的情况，需要进一步获取详情...
            // (略: 完整逻辑见源码，这里主要是获取 tracks 并调用 createMetingResponse)
             const list = data.body.playlist.tracks || [];
             return res.json(createMetingResponse(req, list));
        }

        // 2. 获取歌曲链接 (VIP 关键点)
        if (type === 'url') {
            const data = await song_url({ id, ...commonConfig });
            if (data.body.data && data.body.data[0].url) {
                return res.redirect(data.body.data[0].url); // 重定向到真实 MP3
            } else {
                return res.status(404).send('Not found');
            }
        }
        
        // ... 处理 pic 和 lrc
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

app.get('/', handleRequest);
app.get('/api', handleRequest);

app.listen(port, () => {
    console.log(`Local Meting API running at http://localhost:${port}`);
});
```

### 第二步：配置环境变量与安全措施

为了保护你的 Cookie 不被泄露（尤其是如果你打算将代码提交到 GitHub），我们需要将敏感信息放入 `.env` 文件。

**1. 创建 `.env` 文件**

在 `local-meting` 目录下创建 `.env`：

```text
METING_COOKIE="你的完整网易云 Cookie"
```

**2. 配置 `.gitignore`**

在博客根目录的 `.gitignore` 中加入以下内容，防止敏感文件被上传：

```text
# Meting API Security
local-meting/node_modules/
local-meting/.env
```

### 第三步：配置内网穿透

这里我使用的是 Cloudflare Tunnel（或者 FRP），将本地的 `localhost:3000` 映射到了公网域名 `https://api.wenmozhu.de5.net`。

这一步保证了无论访客在何处访问博客，都能通过这个公网域名请求到我本地运行的 API。

### 第三步：修改 Hexo 配置

打开站点配置文件 `_config.yml`，找到 `aplayer` 配置项，启用自定义 API：

```yaml
# _config.yml
aplayer:
  meting: true
  # 填入你穿透后的 API 地址
  meting_api: 'https://api.wenmozhu.de5.net/api?server=:server&type=:type&id=:id&r=:r'
  asset_inject: false
```

### 第四步：静默启动脚本

为了方便，我写了一个 VBS 脚本 `start_meting_hidden.vbs`，可以后台静默启动 API 服务，看不到黑框框：

```vbscript
Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run "cmd /c cd local-meting && node app.js", 0
Set WshShell = Nothing 
```

将该脚本放入启动文件夹或每次开机运行即可。

## 效果展示

配置完成后，重新部署 Hexo (`hexo clean && hexo g && hexo d`)。

现在打开博客，原本灰色的 VIP 歌曲已经可以流畅播放了！因为请求实际上是经过你的本地服务，带着你的 VIP Cookie 去向网易云要数据的。

---

> **注意**：
>
> 1.请妥善保管你的cookie！不要上传到github等网站！
>
> 2.这样处理主要是因为我的vps在海外，网易云把我的地址屏蔽了，如果你有一个在国内的vps，那么完全可以在上面跑。
>
> 3.只要你有cookie，替换掉app.js的cookie即可使用
