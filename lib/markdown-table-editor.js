'use babel';

import { CompositeDisposable } from 'atom';

import Controller from './controller.js';

export default {
  config: {
  },

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
