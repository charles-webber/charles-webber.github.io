(function (window) {
  'use strict';

  function PJAXBridge(pet) {
    this.pet = pet;
    this.bound = false;
    this.onComplete = this.onComplete.bind(this);
  }

  PJAXBridge.prototype.bind = function () {
    if (this.bound) return;
    this.bound = true;
    document.addEventListener('pjax:complete', this.onComplete);
  };

  PJAXBridge.prototype.onComplete = function () {
    this.pet.unbindPageEvents();
    this.pet.bindPageEvents();
  };

  PJAXBridge.prototype.destroy = function () {
    if (!this.bound) return;
    document.removeEventListener('pjax:complete', this.onComplete);
    this.bound = false;
  };

  window.WebPetPJAXBridge = PJAXBridge;
})(window);
