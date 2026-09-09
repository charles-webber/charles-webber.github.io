(function (window) {
  'use strict';

  function APlayerBridge(pet) {
    this.pet = pet;
    this.bound = false;
    this.onPlay = this.onPlay.bind(this);
  }

  APlayerBridge.prototype.bind = function () {
    if (this.bound || !this.pet.config.music.enabled) return;
    this.bound = true;
    // APlayer ultimately plays a native audio element. Capturing its `play`
    // event keeps this integration independent of APlayer's private globals.
    document.addEventListener('play', this.onPlay, true);
  };

  APlayerBridge.prototype.onPlay = function (event) {
    if (!(event.target instanceof HTMLAudioElement) || !event.target.closest('.aplayer')) return;
    this.pet.sayFrom('music', { priority: 1, cooldown: 30000 });
    if (Math.random() < this.pet.config.music.motionChance) this.pet.playMappedMotion('happy');
  };

  APlayerBridge.prototype.destroy = function () {
    if (!this.bound) return;
    document.removeEventListener('play', this.onPlay, true);
    this.bound = false;
  };

  window.WebPetAPlayerBridge = APlayerBridge;
})(window);
