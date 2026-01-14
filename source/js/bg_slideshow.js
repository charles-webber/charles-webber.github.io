// 动态背景轮播脚本 (v11 - 物理防御版)
(function () {
    let config = { interval: 10000, duration: 2000, images: [] };
    const STORAGE_KEY = 'bgEnabled';

    function isWhiteMode() {
        return document.documentElement.classList.contains('bg-white-mode') || localStorage.getItem(STORAGE_KEY) === '0';
    }

    function disableSlideshow() {
        if (window.bgSlideshowInterval) { clearInterval(window.bgSlideshowInterval); window.bgSlideshowInterval = null; }
        if (window.bgSlideshowTimeout) { clearTimeout(window.bgSlideshowTimeout); window.bgSlideshowTimeout = null; }

        const bgElement = document.getElementById('web_bg');
        const mask = document.getElementById('web_bg_mask');
        if (bgElement) {
            bgElement.style.setProperty('background-image', 'none', 'important');
            bgElement.style.setProperty('background-color', '#ffffff', 'important');
            bgElement.style.opacity = '1';
        }
        if (mask) {
            mask.style.setProperty('background-image', 'none', 'important');
            mask.style.setProperty('background-color', '#ffffff', 'important');
        }
    }

    function startSlideshow() {
        if (isWhiteMode()) { disableSlideshow(); return; }
        if (config.images.length === 0) return;

        const bgElement = document.getElementById('web_bg');
        if (!bgElement) return;

        let currentIndex = 0;
        let mask = document.getElementById('web_bg_mask') || (function () {
            const m = document.createElement('div');
            m.id = 'web_bg_mask';
            m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background-size:cover;background-position:center;z-index:-9999;';
            bgElement.style.zIndex = '-9998';
            document.body.insertBefore(m, document.body.firstChild);
            return m;
        })();

        bgElement.style.setProperty('background-image', 'url("' + config.images[0] + '")', 'important');

        if (window.bgSlideshowInterval) clearInterval(window.bgSlideshowInterval);
        window.bgSlideshowInterval = setInterval(() => {
            if (isWhiteMode()) { disableSlideshow(); return; }

            const nextIndex = (currentIndex + 1) % config.images.length;
            const nextImage = config.images[nextIndex];

            mask.style.backgroundImage = 'url("' + nextImage + '")';
            bgElement.classList.add('bg-fade-transition');
            bgElement.style.opacity = '0';

            window.bgSlideshowTimeout = setTimeout(() => {
                if (isWhiteMode()) { disableSlideshow(); return; }
                bgElement.style.setProperty('background-image', 'url("' + nextImage + '")', 'important');
                bgElement.classList.remove('bg-fade-transition');
                bgElement.style.opacity = '1';
                currentIndex = nextIndex;
            }, config.duration);
        }, config.interval);
    }

    function init(force = false) {
        if (isWhiteMode() && !force) { disableSlideshow(); return; }
        fetch('/vps_bg_config.json').then(r => r.json()).then(data => {
            config.images = data; startSlideshow();
        }).catch(() => {
            fetch('/bg_config.json').then(r => r.json()).then(data => {
                config.images = data; startSlideshow();
            });
        });
    }

    window.addEventListener('bgSlideshowControl', (e) => {
        if (!e.detail.enabled) { disableSlideshow(); } else { init(true); }
    });

    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('pjax:complete', init);
})();
