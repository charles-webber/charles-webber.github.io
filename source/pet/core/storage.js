(function (window) {
  'use strict';

  function Storage(key, debug) {
    this.key = key;
    this.debug = debug;
  }

  Storage.prototype.read = function () {
    try {
      return JSON.parse(window.localStorage.getItem(this.key) || '{}');
    } catch (error) {
      this.warn('localStorage is unavailable', error);
      return {};
    }
  };

  Storage.prototype.write = function (value) {
    try {
      window.localStorage.setItem(this.key, JSON.stringify(value));
      return true;
    } catch (error) {
      this.warn('localStorage write failed', error);
      return false;
    }
  };

  Storage.prototype.get = function (key, fallback) {
    var data = this.read();
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback;
  };

  Storage.prototype.set = function (key, value) {
    var data = this.read();
    data[key] = value;
    return this.write(data);
  };

  Storage.prototype.remove = function (key) {
    var data = this.read();
    delete data[key];
    return this.write(data);
  };

  Storage.prototype.warn = function (message, error) {
    if (this.debug && window.console) console.warn('[WebPet] ' + message, error || '');
  };

  window.WebPetStorage = Storage;
})(window);
