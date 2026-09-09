/* Global knobs for the WebPet. Keep character-specific paths and feature flags here. */
(function (window) {
  'use strict';

  window.WEBPET_CONFIG = {
    enabled: true,

    model: {
      id: 'hiyori',
      // Leave this blank: scripts/webpet-model-manifest.js discovers the real
      // *.model3.json name during `hexo generate`.
      path: null,
      manifestPath: '/pet/model-manifest.js'
    },

    runtime: {
      // Core is intentionally local. Obtain it from the official Cubism SDK
      // and place it in source/pet/vendor/ (see source/pet/README.md).
      coreUrl: '/pet/vendor/live2dcubismcore.min.js',
      // Pinned renderer dependencies are loaded only after a local model has
      // been discovered. They may be self-hosted later by changing these URLs.
      pixiUrl: 'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js',
      adapterUrl: 'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js',
      timeout: 15000
    },

    display: {
      position: 'right',
      width: 220,
      height: 420,
      // Butterfly's #rightside is fixed 40px from the viewport edge. Keep the
      // pet clear of it while retaining the original widget's right-side feel.
      desktop: { x: 96, y: 12 }
    },

    mobile: {
      enabled: true,
      breakpoint: 768,
      scale: 0.65
    },

    dialogue: {
      enabled: true,
      source: '/pet/dialogue.json',
      defaultDuration: 5000,
      cooldown: 5000,
      queueLimit: 5
    },

    idle: {
      enabled: true,
      minInterval: 45000,
      maxInterval: 90000,
      motionChance: 0.30,
      dialogueChance: 0.15,
      bothChance: 0.10
    },

    interaction: {
      live2dClick: true,
      mouseTracking: true,
      pageHover: true,
      copy: true,
      visibility: true,
      hoverCooldown: 15000,
      copyCooldown: 12000,
      returnAfter: 60000,
      clickWindow: 5500
    },

    hoverTargets: [
      { selector: '.article-title', text: ['想看看「{text}」？', '这篇「{text}」看起来挺认真。'] },
      { selector: '#nav .menus_item', text: ['去「{text}」转转？'] },
      { selector: '#aside-content .card-widget', text: ['侧栏里也藏着一些线索。'] },
      { selector: '#search-button', text: ['想找什么？我不会偷看搜索内容。'] },
      { selector: '.aplayer', text: ['这首歌的前奏不错。'] }
    ],

    postEnd: {
      enabled: true,
      selector: '#post #article-container',
      cooldown: 60000,
      threshold: 0.45
    },

    motionMap: {
      idle: ['Idle'],
      tap: ['TapBody', 'Tap', 'tap'],
      happy: ['TapBody', 'FlickHead'],
      special: []
    },

    toolbar: {
      enabled: true,
      screenshot: true,
      chatHook: true
    },

    drag: {
      enabled: true,
      savePosition: true
    },

    music: {
      enabled: true,
      motionChance: 0.25
    },

    storageKey: 'webpet:v1',
    debug: false
  };
})(window);
