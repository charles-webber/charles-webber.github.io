(function (window) {
  'use strict';

  function Interaction(pet) {
    this.pet = pet;
    this.globalBound = false;
    this.petBound = false;
    this.pageListeners = [];
    this.clickCount = 0;
    this.clickTimer = null;
    this.leftAt = 0;
    this.suppressClickUntil = 0;
    this.drag = null;
    this.onCopy = this.onCopy.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    this.onStageClick = this.onStageClick.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
  }

  Interaction.prototype.bindGlobal = function () {
    if (this.globalBound) return;
    this.globalBound = true;
    if (this.pet.config.interaction.copy) document.addEventListener('copy', this.onCopy);
    if (this.pet.config.interaction.visibility) document.addEventListener('visibilitychange', this.onVisibility);
  };

  Interaction.prototype.bindPet = function () {
    if (this.petBound) return;
    this.petBound = true;
    var stage = this.pet.stage;
    stage.addEventListener('click', this.onStageClick);
    stage.addEventListener('pointermove', this.onPointerMove, { passive: true });
    if (this.pet.config.drag.enabled) {
      stage.addEventListener('pointerdown', this.onPointerDown);
      window.addEventListener('pointermove', this.onPointerMove, { passive: true });
      window.addEventListener('pointerup', this.onPointerUp, { passive: true });
      window.addEventListener('pointercancel', this.onPointerUp, { passive: true });
    }
  };

  Interaction.prototype.bindPage = function () {
    var self = this;
    if (!this.pet.config.interaction.pageHover) return;
    this.pet.config.hoverTargets.forEach(function (target) {
      document.querySelectorAll(target.selector).forEach(function (element) {
        var handler = function () {
          var text = self.templateValue(element);
          var choices = target.text && target.text.length ? target.text : self.pet.dialogues.hover;
          self.pet.say(choices, {
            text: self.interpolate(self.pick(choices), { text: text, title: document.title, url: location.pathname, time: self.pet.timeLabel() }),
            key: 'hover:' + target.selector + ':' + text,
            priority: 1,
            cooldown: self.pet.config.interaction.hoverCooldown
          });
        };
        // mouseenter is intentionally used instead of mouseover to avoid
        // descendant churn and repeated bubbles on Butterfly cards.
        element.addEventListener('mouseenter', handler, { passive: true });
        self.pageListeners.push(function () { element.removeEventListener('mouseenter', handler); });
      });
    });
    this.bindPostEndObserver();
  };

  Interaction.prototype.bindPostEndObserver = function () {
    var settings = this.pet.config.postEnd || {};
    if (!settings.enabled || !window.IntersectionObserver) return;
    var article = document.querySelector(settings.selector);
    var target = article && article.lastElementChild;
    if (!target) return;
    var self = this;
    var completed = false;
    var observer = new window.IntersectionObserver(function (entries) {
      if (completed || !entries.some(function (entry) { return entry.isIntersecting; })) return;
      completed = true;
      observer.disconnect();
      self.pet.sayFrom('postEnd', {
        priority: 1,
        cooldown: settings.cooldown,
        key: 'post-end:' + location.pathname
      });
    }, { threshold: settings.threshold });
    observer.observe(target);
    this.pageListeners.push(function () { observer.disconnect(); });
  };

  Interaction.prototype.unbindPage = function () {
    this.pageListeners.splice(0).forEach(function (dispose) { dispose(); });
  };

  Interaction.prototype.onCopy = function () {
    this.pet.sayFrom('copy', { priority: 1, cooldown: this.pet.config.interaction.copyCooldown, key: 'copy' });
  };

  Interaction.prototype.onVisibility = function () {
    if (document.hidden) {
      this.leftAt = Date.now();
      this.pet.pauseIdle();
      return;
    }
    this.pet.resumeIdle();
    if (this.leftAt && Date.now() - this.leftAt >= this.pet.config.interaction.returnAfter) {
      this.pet.sayFrom('visibility.return', { priority: 2, cooldown: 10000, key: 'visibility:return' });
    }
    this.leftAt = 0;
  };

  Interaction.prototype.onStageClick = function (event) {
    if (!this.pet.config.interaction.live2dClick || Date.now() < this.suppressClickUntil) return;
    var areas = this.pet.capabilities.hitAreas || [];
    var hit = areas.find(function (area) {
      return this.pet.adapter.hitTest(area.name, event.clientX, event.clientY);
    }, this);

    this.clickCount += 1;
    window.clearTimeout(this.clickTimer);
    var self = this;
    this.clickTimer = window.setTimeout(function () { self.clickCount = 0; }, this.pet.config.interaction.clickWindow);

    var category = this.clickCount === 1 ? 'click' : (this.clickCount === 2 ? 'clickTwice' : 'clickRapid');
    this.pet.sayFrom(category, { priority: 3, cooldown: 0, key: 'click:' + category + ':' + this.clickCount });
    if (hit || !areas.length) this.pet.playMappedMotion('tap');
  };

  Interaction.prototype.onPointerMove = function (event) {
    if (this.drag) {
      var deltaX = event.clientX - this.drag.startX;
      var deltaY = event.clientY - this.drag.startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) this.drag.moved = true;
      if (this.drag.moved) {
        this.pet.setPosition({
          right: Math.max(8, Math.round(this.drag.right - deltaX)),
          bottom: Math.max(8, Math.round(this.drag.bottom - deltaY))
        }, false);
      }
      return;
    }
    if (this.pet.config.interaction.mouseTracking) this.pet.adapter.focus(event.clientX, event.clientY);
  };

  Interaction.prototype.onPointerDown = function (event) {
    if (event.button !== 0 || !this.pet.config.drag.enabled) return;
    var rect = this.pet.root.getBoundingClientRect();
    this.drag = {
      startX: event.clientX,
      startY: event.clientY,
      right: window.innerWidth - rect.right,
      bottom: window.innerHeight - rect.bottom,
      moved: false
    };
  };

  Interaction.prototype.onPointerUp = function () {
    if (!this.drag) return;
    if (this.drag.moved) {
      this.suppressClickUntil = Date.now() + 120;
      if (this.pet.config.drag.savePosition) this.pet.storage.set('position', this.pet.position);
    }
    this.drag = null;
  };

  Interaction.prototype.pick = function (values) {
    if (!Array.isArray(values) || !values.length) return '';
    return values[Math.floor(Math.random() * values.length)];
  };

  Interaction.prototype.interpolate = function (text, values) {
    return String(text || '').replace(/\{(text|title|url|time)\}/g, function (_, key) { return values[key] || ''; });
  };

  Interaction.prototype.templateValue = function (element) {
    return (element.getAttribute('data-title') || element.getAttribute('title') || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) || '这里';
  };

  Interaction.prototype.destroy = function () {
    this.unbindPage();
    if (this.globalBound) {
      document.removeEventListener('copy', this.onCopy);
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
    if (this.petBound) {
      this.pet.stage.removeEventListener('click', this.onStageClick);
      this.pet.stage.removeEventListener('pointermove', this.onPointerMove);
      this.pet.stage.removeEventListener('pointerdown', this.onPointerDown);
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
    }
    window.clearTimeout(this.clickTimer);
    this.globalBound = false;
    this.petBound = false;
  };

  window.WebPetInteraction = Interaction;
})(window);
