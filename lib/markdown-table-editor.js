'use babel';

import Controller from './controller.js';

export default {
  controler: null,

  activate() {
    this.controller = new Controller();
  },

  deactivate() {
    this.controller.destroy();
  },

  serialize() {
  }
};
