// 背景切换控制器 (v12 - 增加全屏欣赏按钮)
(function () {
    const STORAGE_KEY = 'bgEnabled';

    function applyInitialState() {
        const bgEnabled = localStorage.getItem(STORAGE_KEY) !== '0';
        if (!bgEnabled) {
            document.documentElement.classList.add('bg-white-mode');
        } else {
            document.documentElement.classList.remove('bg-white-mode');
        }
    }
    applyInitialState();

    document.addEventListener('DOMContentLoaded', function () {
        // 0. 移除旧按钮
        const rightsideNode = document.getElementById('rightside');
        if (rightsideNode) {
            const buttons = rightsideNode.querySelectorAll('button, a');
            buttons.forEach(btn => {
                if (btn.title && (btn.title.includes('背景') || btn.title.includes('Background'))) {
                    btn.style.setProperty('display', 'none', 'important');
                }
            });
        }

        if (document.getElementById('bg-simple-toggle-btn')) return;

        // 1. 创建双按钮：功能切换 + 全屏预览
        // 增加 .bg-btn-premium 样式类实现用户要求的“图片化效果”
        const buttonHTML = `
        <button id="bg-gallery-btn" type="button" title="独立欣赏背景轮播" class="bg-btn-premium">
            <i class="fas fa-eye"></i>
        </button>
        <button id="bg-simple-toggle-btn" type="button" title="切换背景 (图/白底)" class="bg-btn-premium">
            <i class="fas fa-image"></i>
        </button>
        `;

        const rightside = document.getElementById('rightside');
        if (rightside) {
            rightside.insertAdjacentHTML('afterbegin', buttonHTML);
        }

        const toggleBtn = document.getElementById('bg-simple-toggle-btn');
        const galleryBtn = document.getElementById('bg-gallery-btn');

        // 更新 UI 图标函数
        function updateUI() {
            const bgEnabled = localStorage.getItem(STORAGE_KEY) !== '0';
            if (!bgEnabled) {
                toggleBtn.querySelector('i').className = 'fas fa-image-slash';
                toggleBtn.title = "开启背景图";
                document.documentElement.classList.add('bg-white-mode');
            } else {
                toggleBtn.querySelector('i').className = 'fas fa-image';
                toggleBtn.title = "切换为白底";
                document.documentElement.classList.remove('bg-white-mode');
            }
        }

        updateUI();

        // 功能1：图/白 切换
        toggleBtn.addEventListener('click', function () {
            const nowEnabled = localStorage.getItem(STORAGE_KEY) !== '0';
            const targetEnabled = !nowEnabled;
            localStorage.setItem(STORAGE_KEY, targetEnabled ? '1' : '0');
            updateUI();
            window.dispatchEvent(new CustomEvent('bgSlideshowControl', { detail: { enabled: targetEnabled } }));
        });

        // 功能2：全屏预览
        galleryBtn.addEventListener('click', function () {
            window.open('/gallery.html', '_blank');
        });
    });

    document.addEventListener('pjax:complete', applyInitialState);
})();
