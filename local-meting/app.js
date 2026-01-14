const express = require('express');
require('dotenv').config();
const { song_url, lyric, playlist_track_all, song_detail, playlist_detail } = require('NeteaseCloudMusicApi');
const cors = require('cors');
const app = express();
const port = 3000;

// ====== 从环境变量读取 Cookie ======
const MY_COOKIE = process.env.METING_COOKIE || '';
// ==========================================================
// ==========================================================

app.use(cors());

// 工具：统一响应格式
const createMetingResponse = (req, list) => {
    const { protocol, headers } = req;
    // 如果你在本地测试，host可能是 localhost:3000
    // 如果你用了 frp/cloudflared 穿透，这里会自动获取访问的域名
    const host = headers.host;

    // 强制使用 HTTPS (防止博客是 HTTPS 而这里返回 HTTP 导致混合内容报错)
    const baseUrl = `https://${host}/`;

    return list.map(item => {
        return {
            title: item.name,
            author: item.ar ? item.ar.map(a => a.name).join('/') : 'Unknown',
            // 构造递归回调链接
            url: `${baseUrl}?server=netease&type=url&id=${item.id}`,
            pic: `${baseUrl}?server=netease&type=pic&id=${item.id}`,
            lrc: `${baseUrl}?server=netease&type=lrc&id=${item.id}`
        };
    });
};

app.get('/', async (req, res) => {
    // 兼容 /api 路径（如果前端请求带 /api）
    handleRequest(req, res);
});

app.get('/api', async (req, res) => {
    handleRequest(req, res);
});

app.get('/meting', async (req, res) => {
    handleRequest(req, res);
});

const handleRequest = async (req, res) => {
    const { server, type, id } = req.query;

    if (server !== 'netease') {
        return res.json({ error: 'Only netease is supported locally' });
    }

    try {
        let result;
        const commonConfig = { cookie: MY_COOKIE, realIP: '116.25.146.177' }; // 假装是国内IP

        // 1. 获取歌单
        if (type === 'playlist') {
            // 获取歌单详情（拿 tracks）
            const data = await playlist_detail({ id, ...commonConfig });
            if (data.body.playlist && data.body.playlist.tracks) {
                // 转换格式
                const list = data.body.playlist.tracks;
                return res.json(createMetingResponse(req, list));
            } else {
                // 如果是很多歌曲，可能只返回了 trackIds，需要通过 track_all 获取
                const allTracks = await playlist_track_all({ id, limit: 1000, ...commonConfig });
                return res.json(createMetingResponse(req, allTracks.body.songs));
            }
        }

        // 2. 获取歌曲链接 (VIP 关键点)
        if (type === 'url') {
            const data = await song_url({ id, ...commonConfig });
            // 网易云返回的 url 可能为 null (vip 限制或无版权)
            // 但因为我们在本地跑，理论上应该能拿到
            if (data.body.data && data.body.data[0].url) {
                // 302 重定向到真实链接
                return res.redirect(data.body.data[0].url);
            } else {
                return res.status(404).send('Not found');
            }
        }

        // 3. 获取封面
        if (type === 'pic') {
            const data = await song_detail({ ids: id, ...commonConfig });
            if (data.body.songs && data.body.songs[0] && data.body.songs[0].al) {
                return res.redirect(data.body.songs[0].al.picUrl);
            }
            return res.status(404).send('Pic Not found');
        }

        // 4. 获取歌词
        if (type === 'lrc') {
            const data = await lyric({ id, ...commonConfig });
            if (data.body.lrc) {
                return res.send(data.body.lrc.lyric);
            }
            return res.send('[00:00.00] No Lyric');
        }

        res.json({ error: 'Unknown type' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
};

app.listen(port, () => {
    console.log(`Local Meting API running at http://localhost:${port}`);
    console.log(`Please verify your cookie in app.js if you need VIP access.`);
});
