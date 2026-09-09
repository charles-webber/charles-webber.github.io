(function (window, document) {
  'use strict';

  function Adapter(stage, config, log) {
    this.stage = stage;
    this.config = config;
    this.log = log || function () {};
    this.frame = null;
    this.readyTimer = null;
    this.messageHandler = null;
  }

  Adapter.prototype.init = function () {
    var self = this;
    this.destroyModel();

    return new Promise(function (resolve, reject) {
      var frame = document.createElement('iframe');
      var settled = false;
      var timeout = Math.max(3000, self.config.runtime.timeout || 15000);

      function finish(error) {
        if (settled) return;
        settled = true;
        window.clearTimeout(self.readyTimer);
        if (error) reject(error);
        else resolve(frame);
      }

      self.messageHandler = function (event) {
        if (event.source !== frame.contentWindow || !event.data || event.data.channel !== 'webpet-official') return;
        if (event.data.type === 'ready') finish();
        if (event.data.type === 'error') finish(new Error(event.data.message || 'Official Cubism renderer failed to start'));
      };
      window.addEventListener('message', self.messageHandler);

      frame.className = 'web-pet-official-frame';
      frame.title = 'Hiyori Live2D character';
      frame.setAttribute('aria-label', 'Hiyori Live2D character');
      frame.addEventListener('load', function () {
        // The module bootstraps the official framework after the iframe load
        // event. The fallback keeps a transient messaging problem from
        // hiding a renderer that has otherwise loaded successfully.
        self.readyTimer = window.setTimeout(function () { finish(); }, Math.min(3000, timeout));
      }, { once: true });
      frame.addEventListener('error', function () {
        finish(new Error('Official Cubism renderer page could not be loaded'));
      }, { once: true });
      frame.src = self.config.runtime.officialFrameUrl;
      self.frame = frame;
      self.stage.replaceChildren(frame);
    });
  };

  Adapter.prototype.motion = function () {
    // The official sample starts its Hiyori Idle group itself. The parent
    // dialogue system remains responsible for semantic click feedback.
    return Boolean(this.frame);
  };

  Adapter.prototype.expression = function () { return false; };
  Adapter.prototype.focus = function () {};
  Adapter.prototype.hitTest = function () { return false; };
  Adapter.prototype.setLipSync = function () { return false; };

  Adapter.prototype.capture = function () {
    if (!this.frame) return null;
    try {
      var canvas = this.frame.contentDocument.querySelector('canvas');
      return canvas ? canvas.toDataURL('image/png') : null;
    } catch (error) {
      this.log('Screenshot failed', error);
      return null;
    }
  };

  Adapter.prototype.destroyModel = function () {
    window.clearTimeout(this.readyTimer);
    this.readyTimer = null;
    if (this.messageHandler) window.removeEventListener('message', this.messageHandler);
    this.messageHandler = null;
    if (this.frame) this.frame.remove();
    this.frame = null;
    this.stage.replaceChildren();
  };

  window.WebPetLive2DAdapter = Adapter;
})(window, document);
