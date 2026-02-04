// Cloudflare Worker - Meting API Proxy
// 部署到 Cloudflare Workers 后绑定到 api.wenmozhu.de5.net

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const params = url.searchParams;
    
    const server = params.get('server');
    const type = params.get('type');
    const id = params.get('id');

    // 只支持网易云
    if (server !== 'netease') {
      return new Response(JSON.stringify({ error: 'Only netease is supported' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      let apiUrl;
      
      // 使用公共 Meting API 或者你自己的 VPS API
      // 方案 1: 使用公共 API (可能不稳定)
      // apiUrl = `https://api.injahow.cn/meting/?server=${server}&type=${type}&id=${id}`;
      
      // 方案 2: 代理到你的 VPS (需要在 VPS 上部署 Meting API)
      apiUrl = `http://20.239.25.118:3000/?server=${server}&type=${type}&id=${id}`;

      const response = await fetch(apiUrl);
      const data = await response.text();
      
      return new Response(data, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
