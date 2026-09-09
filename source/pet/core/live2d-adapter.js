(function (window) {
  'use strict';

  var loadedScripts = {};

  function Adapter(stage, config, log) {
    this.stage = stage;
    this.config = config;
    this.log = log || function () {};
    this.app = null;
    this.model = null;
    this.modelBounds = null;
    this.resizeObserver = null;
  }

  Adapter.prototype.loadScript = function (url, test, label) {
    var timeout = this.config.runtime.timeout || 15000;
    if (test()) return Promise.resolve();
    if (loadedScripts[url]) return loadedScripts[url];

    loadedScripts[url] = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      var timer = window.setTimeout(function () {
        script.remove();
        reject(new Error(label + ' timed out'));
      }, timeout);
      script.src = url;
      script.async = true;
      script.dataset.webpetRuntime = 'true';
      script.onload = function () {
        window.clearTimeout(timer);
        if (test()) resolve();
        else reject(new Error(label + ' loaded without its expected global'));
      };
      script.onerror = function () {
        window.clearTimeout(timer);
        reject(new Error(label + ' could not be loaded: ' + url));
      };
      document.head.appendChild(script);
    });
    return loadedScripts[url];
  };

  Adapter.prototype.ensureRuntime = async function () {
    var runtime = this.config.runtime;
    await this.loadScript(runtime.coreUrl, function () { return Boolean(window.Live2DCubismCore); }, 'Live2D Cubism Core');
    await this.loadScript(runtime.pixiUrl, function () { return Boolean(window.PIXI && window.PIXI.Application); }, 'PixiJS');
    await this.loadScript(runtime.adapterUrl, function () {
      return Boolean(window.PIXI && window.PIXI.live2d && window.PIXI.live2d.Live2DModel);
    }, 'pixi-live2d-display');
  };

  Adapter.prototype.init = async function (modelPath) {
    await this.ensureRuntime();
    this.destroyModel();

    this.app = new window.PIXI.Application({
      width: Math.max(1, this.stage.clientWidth),
      height: Math.max(1, this.stage.clientHeight),
      transparent: true,
      antialias: true,
      autoStart: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.app.renderer.backgroundAlpha = 0;
    this.app.view.className = 'web-pet-canvas';
    this.app.view.setAttribute('aria-label', 'Live2D web pet');
    this.stage.replaceChildren(this.app.view);

    var Live2DModel = window.PIXI.live2d.Live2DModel;
    this.model = await Live2DModel.from(modelPath, {
      autoInteract: false,
      autoUpdate: true,
      motionPreload: 'NONE'
    });
    this.app.stage.addChild(this.model);
    // Keep the unscaled bounds. Reading model.width/model.height after a
    // resize returns scaled values, which would make a later ResizeObserver
    // pass reset the model back to 1:1 and push it outside the canvas.
    this.modelBounds = this.model.getLocalBounds();

    // The renderer's automatic Idle group is disabled. WebPet schedules sparse
    // idle decisions itself, preventing a perpetually animated page ornament.
    try {
      this.model.internalModel.motionManager.groups.idle = '__webpet_disabled__';
    } catch (error) {
      this.log('Unable to override automatic idle motion', error);
    }

    this.resize();
    this.installResizeObserver();
    return this.model;
  };

  Adapter.prototype.installResizeObserver = function () {
    var self = this;
    if (!window.ResizeObserver || this.resizeObserver) return;
    this.resizeObserver = new window.ResizeObserver(function () { self.resize(); });
    this.resizeObserver.observe(this.stage);
  };

  Adapter.prototype.resize = function () {
    if (!this.app || !this.model) return;
    var width = Math.max(1, this.stage.clientWidth);
    var height = Math.max(1, this.stage.clientHeight);
    this.app.renderer.resize(width, height);

    var bounds = this.modelBounds || this.model.getLocalBounds();
    var sourceWidth = Math.max(1, bounds.width || width);
    var sourceHeight = Math.max(1, bounds.height || height);
    var scale = Math.min(width / sourceWidth, height / sourceHeight);
    this.model.scale.set(scale);
    this.model.x = (width - sourceWidth * scale) / 2 - bounds.x * scale;
    this.model.y = height - sourceHeight * scale - bounds.y * scale;
  };

  Adapter.prototype.motion = function (group, index) {
    if (!this.model || !group) return false;
    try {
      this.model.motion(group, index);
      return true;
    } catch (error) {
      this.log('Motion unavailable: ' + group, error);
      return false;
    }
  };

  Adapter.prototype.expression = function (name) {
    if (!this.model || !name) return false;
    try {
      this.model.expression(name);
      return true;
    } catch (error) {
      this.log('Expression unavailable: ' + name, error);
      return false;
    }
  };

  Adapter.prototype.focus = function (clientX, clientY) {
    if (!this.model || typeof this.model.focus !== 'function') return;
    var rect = this.app.view.getBoundingClientRect();
    try {
      this.model.focus(clientX - rect.left, clientY - rect.top);
    } catch (error) {
      this.log('Mouse tracking failed', error);
    }
  };

  Adapter.prototype.hitTest = function (area, clientX, clientY) {
    if (!this.model || !area || typeof this.model.hitTest !== 'function') return false;
    var rect = this.app.view.getBoundingClientRect();
    try {
      return Boolean(this.model.hitTest(area, clientX - rect.left, clientY - rect.top));
    } catch (error) {
      this.log('Hit test failed for ' + area, error);
      return false;
    }
  };

  Adapter.prototype.setLipSync = function (value) {
    if (!this.model) return false;
    try {
      this.model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', Math.max(0, Math.min(1, value)));
      return true;
    } catch (error) {
      this.log('Lip sync parameter is unavailable', error);
      return false;
    }
  };

  Adapter.prototype.capture = function () {
    if (!this.app || !this.model) return null;
    try {
      return this.app.renderer.extract.canvas(this.model).toDataURL('image/png');
    } catch (error) {
      this.log('Screenshot failed', error);
      return null;
    }
  };

  Adapter.prototype.destroyModel = function () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.model) {
      try { this.model.destroy({ children: true, texture: false, baseTexture: false }); } catch (error) { this.log('Model destroy failed', error); }
      this.model = null;
    }
    this.modelBounds = null;
    if (this.app) {
      try { this.app.destroy(true, { children: true, texture: false, baseTexture: false }); } catch (error) { this.log('Renderer destroy failed', error); }
      this.app = null;
    }
    this.stage.replaceChildren();
  };

  window.WebPetLive2DAdapter = Adapter;
})(window);
