(function (window) {
  'use strict';

  function asArray(value) {
    return Array.isArray(value) ? value : [value];
  }

  function Dialogue(element, config) {
    this.element = element;
    this.config = config;
    this.queue = [];
    this.cooldowns = {};
    this.current = null;
    this.timer = null;
  }

  Dialogue.prototype.pick = function (value) {
    var choices = asArray(value).filter(Boolean);
    return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null;
  };

  Dialogue.prototype.normalise = function (value, options) {
    var picked = this.pick(value);
    if (!picked) return null;
    var message = typeof picked === 'string' ? { text: picked } : Object.assign({}, picked);
    return Object.assign({
      duration: this.config.defaultDuration,
      priority: 1,
      cooldown: this.config.cooldown,
      key: message.text
    }, message, options || {});
  };

  Dialogue.prototype.say = function (value, options) {
    var message = this.normalise(value, options);
    if (!message || !message.text) return false;
    var now = Date.now();
    if (message.cooldown && this.cooldowns[message.key] && now - this.cooldowns[message.key] < message.cooldown) return false;
    this.cooldowns[message.key] = now;

    if (this.current && message.priority > this.current.priority) this.dismiss();
    if (this.current) {
      if (this.queue.length >= this.config.queueLimit) this.queue.shift();
      this.queue.push(message);
      this.queue.sort(function (a, b) { return b.priority - a.priority; });
      return true;
    }
    this.render(message);
    return true;
  };

  Dialogue.prototype.render = function (message) {
    var self = this;
    this.current = message;
    this.element.textContent = message.text;
    this.element.hidden = false;
    this.element.classList.add('web-pet-dialog--visible');
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(function () { self.dismiss(); }, Math.max(800, message.duration));
  };

  Dialogue.prototype.dismiss = function () {
    var self = this;
    window.clearTimeout(this.timer);
    this.timer = null;
    this.element.classList.remove('web-pet-dialog--visible');
    this.current = null;
    window.setTimeout(function () {
      if (!self.current) self.element.hidden = true;
    }, 180);
    if (this.queue.length) this.render(this.queue.shift());
  };

  Dialogue.prototype.destroy = function () {
    this.queue = [];
    this.dismiss();
  };

  window.WebPetDialogue = Dialogue;
})(window);
