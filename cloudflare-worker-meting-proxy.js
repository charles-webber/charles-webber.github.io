export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // 代理到 Vercel 部署的 Meting API（带 VIP Cookie）
    // 保持完整的路径和查询参数
    const vercelUrl = `https://meting-api-lemon-kappa.vercel.app${url.pathname}${url.search}`;
    
    try {
      const response = await fetch(vercelUrl, {
        method: request.method,
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        }
      });
      
      // 如果是重定向，直接返回重定向
      if (response.status === 301 || response.status === 302) {
        return Response.redirect(response.headers.get('Location'), response.status);
      }
      
      const data = await response.text();
      const contentType = response.headers.get('Content-Type');
      
      return new Response(data, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        }
      });
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: error.message,
        requestedUrl: vercelUrl 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
