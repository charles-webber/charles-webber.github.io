const fs = require('fs');
const path = require('path');

// 注册一个 Hexo 生成器
// 功能：在 hexo generate 时，自动扫描 source/imgs/bg 目录
// 生成一个名为 bg_config.json 的文件，包含所有图片的路径列表
hexo.extend.generator.register('bg_img_list', function(locals) {
    const bgDir = path.join(hexo.source_dir, 'imgs', 'bg');
    let fileList = [];

    // 检查目录是否存在
    if (fs.existsSync(bgDir)) {
        // 读取目录下的所有文件
        fileList = fs.readdirSync(bgDir).filter(function(file) {
            // 只保留图片格式文件
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
        }).map(function(file) {
            // 拼接成网站可访问的路径
            return '/imgs/bg/' + file;
        });
    }

    // 返回生成的数据
    return {
        path: 'bg_config.json',
        data: JSON.stringify(fileList)
    };
});
