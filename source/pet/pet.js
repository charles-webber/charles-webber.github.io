(function (window, document) {
  'use strict';

  var VERSION = '1.0.0';

  function getByPath(object, path) {
    return path.split('.').reduce(function (value, key) { return value && value[key]; }, object);
  }

  function WebPet(config) {
    this.__webPetVersion = VERSION;
    this.config = config;
    this.root = null;
    this.stage = null;
    this.toolbar = null;
    this.dialogueElement = null;
    this.dialogueEngine = null;
    this.dialogues = {};
    this.storage = null;
    this.adapter = null;
    this.interaction = null;
    this.pjax = null;
    this.aplayer = null;
    this.capabilities = { hitAreas: [], motionGroups: [], expressions: [], physics: false, pose: false, lipSync: false };
    this.modelDefinition = null;
    this.modelPath = null;
    this.position = null;
    this.initialized = false;
    this.modelReady = false;
    this.idleTimer = null;
    this.pageVisible = !document.hidden;
    this.warned = {};
    this.mediaQuery = null;
    this.onToolbarClick = this.onToolbarClick.bind(this);
    this.onMobileChange = this.onMobileChange.bind(this);
  }

  WebPet.prototype.log = function (message, error) {
    if (this.config.debug && window.console) console.info('[WebPet] ' + message, error || '');
  };

  WebPet.prototype.warn = function (key, message, error) {
    if (this.warned[key]) return;
    this.warned[key] = true;
    if (window.console) console.warn('[WebPet] ' + message, error || '');
  };

  WebPet.prototype.ensureDom = function () {
    var all = document.querySelectorAll('#web-pet');
    if (all.length) {
      this.root = all[0];
      Array.prototype.slice.call(all, 1).forEach(function (node) { node.remove(); });
    } else {
      this.root = document.createElement('section');
      this.root.id = 'web-pet';
      this.root.setAttribute('aria-label', 'Web pet');
      this.root.innerHTML = '<div id="web-pet-dialog" role="status" aria-live="polite" hidden></div><div id="web-pet-stage"></div><div id="web-pet-toolbar" aria-label="Web pet controls"><button type="button" data-action="toggle" aria-label="Hide or show web pet" title="Hide or show">◐</button><button type="button" data-action="motion" aria-label="Play a motion" title="Play a motion">✦</button><button type="button" data-action="expression" aria-label="Change expression" title="Change expression" hidden>◡</button><button type="button" data-action="capture" aria-label="Save a screenshot" title="Save a screenshot">▣</button><button type="button" data-action="reset" aria-label="Reset position" title="Reset position">↺</button></div>';
      document.body.appendChild(this.root);
    }
    this.stage = this.root.querySelector('#web-pet-stage');
    this.toolbar = this.root.querySelector('#web-pet-toolbar');
    this.dialogueElement = this.root.querySelector('#web-pet-dialog');
  };

  WebPet.prototype.initOnce = async function () {
    if (this.initialized || !this.config.enabled) return this;
    this.initialized = true;
    this.ensureDom();
    this.storage = new window.WebPetStorage(this.config.storageKey, this.config.debug);
    this.dialogueEngine = new window.WebPetDialogue(this.dialogueElement, this.config.dialogue);
    this.adapter = new window.WebPetLive2DAdapter(this.stage, this.config, this.log.bind(this));
    this.interaction = new window.WebPetInteraction(this);
    this.pjax = new window.WebPetPJAXBridge(this);
    this.aplayer = new window.WebPetAPlayerBridge(this);
    this.toolbar.addEventListener('click', this.onToolbarClick);
    this.applyStoredState();
    this.bindMobileQuery();
    this.interaction.bindGlobal();
    this.interaction.bindPet();
    this.pjax.bind();
    this.aplayer.bind();
    this.bindPageEvents();

    await this.loadDialogues();
    var storedModel = this.storage.get('modelId', this.config.model.id);
    await this.loadModel(storedModel);
    return this;
  };

  WebPet.prototype.loadDialogues = async function () {
    try {
      var response = await window.fetch(this.config.dialogue.source, { cache: 'force-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      this.dialogues = await response.json();
    } catch (error) {
      this.warn('dialogues', 'Dialogue file could not be loaded; continuing without scripted lines.', error);
      this.dialogues = {};
    }
  };

  WebPet.prototype.resolveModel = function (id) {
    var manifest = window.WEBPET_MODEL_MANIFEST || {};
    if (id === this.config.model.id && this.config.model.path) return { id: id, path: this.config.model.path };
    return manifest[id] || null;
  };

  WebPet.prototype.loadModel = async function (id) {
    var model = this.resolveModel(id);
    this.modelReady = false;
    this.stopIdle();
    this.root.classList.remove('web-pet--failed');
    if (!model || !model.path) {
      this.failModel('model:' + id, 'No .model3.json was found for “' + id + '”. See /pet/README.md for the official Hiyori files to install.');
      return false;
    }

    try {
      var response = await window.fetch(model.path, { cache: 'force-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + model.path);
      this.modelDefinition = await response.json();
      this.capabilities = this.readCapabilities(this.modelDefinition);
      this.modelPath = model.path;
      this.log('Loading model ' + model.path);
      await this.adapter.init(model.path);
      this.modelReady = true;
      this.storage.set('modelId', id);
      this.updateToolbar();
      this.show(false);
      this.welcomeOnce();
      this.resumeIdle();
      return true;
    } catch (error) {
      this.failModel('load:' + id, 'Live2D model failed to load. The blog remains available.', error);
      return false;
    }
  };

  WebPet.prototype.failModel = function (key, message, error) {
    this.modelReady = false;
    this.root.classList.add('web-pet--failed');
    this.updateToolbar();
    this.warn(key, message, error);
  };

  WebPet.prototype.readCapabilities = function (definition) {
    var refs = definition.FileReferences || {};
    var groups = definition.Groups || [];
    return {
      hitAreas: (definition.HitAreas || []).map(function (area) { return { name: area.Name, id: area.Id }; }),
      motionGroups: Object.keys(refs.Motions || {}),
      expressions: (refs.Expressions || []).map(function (expression) { return expression.Name; }).filter(Boolean),
      physics: Boolean(refs.Physics),
      pose: Boolean(refs.Pose),
      lipSync: groups.some(function (group) { return group.Name === 'LipSync'; })
    };
  };

  WebPet.prototype.say = function (message, options) {
    if (!this.config.dialogue.enabled || !this.dialogueEngine) return false;
    return this.dialogueEngine.say(message, options);
  };

  WebPet.prototype.sayFrom = function (path, options) {
    return this.say(getByPath(this.dialogues, path), options);
  };

  WebPet.prototype.hasMotion = function (group) {
    return this.capabilities.motionGroups.indexOf(group) !== -1;
  };

  WebPet.prototype.motion = function (group, index) {
    if (!this.hasMotion(group)) return false;
    return this.adapter.motion(group, index);
  };

  WebPet.prototype.playMappedMotion = function (meaning) {
    var groups = this.config.motionMap[meaning] || [];
    var group = groups.find(this.hasMotion.bind(this));
    return group ? this.motion(group) : false;
  };

  WebPet.prototype.hasExpression = function (name) {
    return this.capabilities.expressions.indexOf(name) !== -1;
  };

  WebPet.prototype.expression = function (name) {
    return this.hasExpression(name) && this.adapter.expression(name);
  };

  WebPet.prototype.randomExpression = function () {
    var list = this.capabilities.expressions;
    return list.length ? this.expression(list[Math.floor(Math.random() * list.length)]) : false;
  };

  WebPet.prototype.setMouth = function (value) {
    return this.capabilities.lipSync && this.adapter.setLipSync(value);
  };

  WebPet.prototype.welcomeOnce = function () {
    try {
      if (window.sessionStorage.getItem('webpet:welcomed')) return;
      window.sessionStorage.setItem('webpet:welcomed', '1');
    } catch (error) {
      this.log('sessionStorage is unavailable', error);
    }
    this.sayFrom('time.' + this.timeBucket(), { priority: 2, cooldown: 0, key: 'welcome:time' });
  };

  WebPet.prototype.timeBucket = function () {
    var hour = new Date().getHours();
    if (hour >= 6 && hour <= 10) return 'morning';
    if (hour >= 11 && hour <= 13) return 'noon';
    if (hour >= 14 && hour <= 17) return 'afternoon';
    if (hour >= 18 && hour <= 22) return 'evening';
    return 'lateNight';
  };

  WebPet.prototype.timeLabel = function () {
    return ({ morning: '上午', noon: '中午', afternoon: '下午', evening: '晚上', lateNight: '深夜' })[this.timeBucket()];
  };

  WebPet.prototype.startIdle = function () {
    var self = this;
    if (!this.modelReady || !this.config.idle.enabled || !this.pageVisible || this.root.classList.contains('web-pet--is-hidden')) return;
    this.stopIdle();
    var min = this.config.idle.minInterval;
    var delay = min + Math.random() * Math.max(0, this.config.idle.maxInterval - min);
    this.idleTimer = window.setTimeout(function () { self.runIdle(); }, delay);
  };

  WebPet.prototype.runIdle = function () {
    if (!this.modelReady || !this.pageVisible) return;
    var roll = Math.random();
    var both = this.config.idle.bothChance;
    var motion = both + this.config.idle.motionChance;
    var dialogue = motion + this.config.idle.dialogueChance;
    if (roll < both) {
      this.playMappedMotion('idle');
      this.sayFrom('random', { priority: 1, cooldown: 15000, key: 'idle:both' });
    } else if (roll < motion) {
      this.playMappedMotion('idle');
    } else if (roll < dialogue) {
      this.sayFrom('random', { priority: 1, cooldown: 15000, key: 'idle:dialogue' });
    }
    this.startIdle();
  };

  WebPet.prototype.stopIdle = function () {
    window.clearTimeout(this.idleTimer);
    this.idleTimer = null;
  };

  WebPet.prototype.pauseIdle = function () {
    this.pageVisible = false;
    this.stopIdle();
  };

  WebPet.prototype.resumeIdle = function () {
    this.pageVisible = true;
    this.startIdle();
  };

  WebPet.prototype.bindPageEvents = function () {
    if (this.interaction) this.interaction.bindPage();
  };

  WebPet.prototype.unbindPageEvents = function () {
    if (this.interaction) this.interaction.unbindPage();
  };

  WebPet.prototype.applyStoredState = function () {
    var fallback = { right: this.config.display.desktop.x, bottom: this.config.display.desktop.y };
    this.position = this.storage.get('position', fallback);
    this.setPosition(this.position, false);
    if (this.storage.get('hidden', false)) this.root.classList.add('web-pet--is-hidden');
  };

  WebPet.prototype.setPosition = function (position, persist) {
    this.position = {
      right: Math.max(8, Number(position.right)),
      bottom: Math.max(8, Number(position.bottom))
    };
    this.root.style.right = this.position.right + 'px';
    this.root.style.bottom = this.position.bottom + 'px';
    if (persist && this.config.drag.savePosition) this.storage.set('position', this.position);
    return this.position;
  };

  WebPet.prototype.resetPosition = function () {
    var position = { right: this.config.display.desktop.x, bottom: this.config.display.desktop.y };
    this.setPosition(position, true);
    this.say('位置已经回到右下角。', { priority: 2, cooldown: 0, key: 'reset-position' });
  };

  WebPet.prototype.show = function (persist) {
    this.root.classList.remove('web-pet--is-hidden');
    if (persist !== false) this.storage.set('hidden', false);
    this.resumeIdle();
  };

  WebPet.prototype.hide = function (persist) {
    this.root.classList.add('web-pet--is-hidden');
    if (persist !== false) this.storage.set('hidden', true);
    this.stopIdle();
  };

  WebPet.prototype.toggle = function () {
    if (this.root.classList.contains('web-pet--is-hidden')) this.show();
    else this.hide();
  };

  WebPet.prototype.changeModel = async function (id) {
    if (!id || !this.resolveModel(id)) return false;
    return this.loadModel(id);
  };

  WebPet.prototype.capture = function () {
    var image = this.adapter.capture();
    if (!image) return false;
    var link = document.createElement('a');
    link.href = image;
    link.download = 'webpet-' + (this.storage.get('modelId', this.config.model.id) || 'model') + '.png';
    link.click();
    return true;
  };

  WebPet.prototype.chat = function () {
    // Reserved for a future server-side /api/pet/chat proxy. No API key, user
    // input, or request is handled by this first version.
    this.say('聊天功能还在路上。', { priority: 2, cooldown: 10000, key: 'chat-placeholder' });
    return Promise.resolve(null);
  };

  WebPet.prototype.getState = function () {
    return {
      version: VERSION,
      modelReady: this.modelReady,
      modelPath: this.modelPath,
      hidden: this.root.classList.contains('web-pet--is-hidden'),
      position: Object.assign({}, this.position),
      capabilities: JSON.parse(JSON.stringify(this.capabilities))
    };
  };

  WebPet.prototype.updateToolbar = function () {
    if (!this.toolbar) return;
    this.toolbar.hidden = !this.config.toolbar.enabled || !this.modelReady;
    var expression = this.toolbar.querySelector('[data-action="expression"]');
    if (expression) expression.hidden = !this.capabilities.expressions.length;
    var capture = this.toolbar.querySelector('[data-action="capture"]');
    if (capture) capture.hidden = !this.config.toolbar.screenshot;
  };

  WebPet.prototype.onToolbarClick = function (event) {
    var button = event.target.closest('button[data-action]');
    if (!button) return;
    var action = button.dataset.action;
    if (action === 'toggle') this.toggle();
    if (action === 'motion') this.playMappedMotion('tap');
    if (action === 'expression') this.randomExpression();
    if (action === 'capture') this.capture();
    if (action === 'reset') this.resetPosition();
  };

  WebPet.prototype.bindMobileQuery = function () {
    if (!window.matchMedia) return;
    this.mediaQuery = window.matchMedia('(max-width: ' + this.config.mobile.breakpoint + 'px)');
    this.onMobileChange(this.mediaQuery);
    if (this.mediaQuery.addEventListener) this.mediaQuery.addEventListener('change', this.onMobileChange);
    else this.mediaQuery.addListener(this.onMobileChange);
  };

  WebPet.prototype.onMobileChange = function (event) {
    var mobile = event.matches;
    this.root.classList.toggle('web-pet--mobile', mobile);
    this.root.style.setProperty('--web-pet-mobile-scale', this.config.mobile.scale);
    if (mobile && !this.config.mobile.enabled) this.hide(false);
    else if (!mobile && !this.storage.get('hidden', false)) this.show(false);
  };

  function start() {
    if (!window.WEBPET_CONFIG || !window.WEBPET_CONFIG.enabled) return;
    if (window.WebPet && window.WebPet.__webPetVersion) {
      window.WebPet.unbindPageEvents();
      window.WebPet.bindPageEvents();
      return;
    }
    window.WebPet = new WebPet(window.WEBPET_CONFIG);
    window.WebPet.initOnce();
  }

  function scheduleStart() {
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2500 });
    else window.setTimeout(start, 250);
  }

  // Third-party widgets can keep window.load pending indefinitely. Starting
  // after DOMContentLoaded and yielding to idle time keeps WebPet non-blocking
  // without coupling it to unrelated network resources.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleStart, { once: true });
  else scheduleStart();
})(window, document);
