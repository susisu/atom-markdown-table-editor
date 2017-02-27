'use babel';

import { CompositeDisposable } from 'atom';

import Controller from './controller.js';

export default {
  config: {
    grammars: {
      type   : 'array',
      default: ['source.gfm'],
      items  : {
        type: 'string'
      }
    }
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
