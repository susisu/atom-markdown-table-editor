'use babel';

import Controller from './controller.js';

export default {
  config: {
    grammars: {
      type   : 'array',
      default: ['source.gfm'],
      items  : {
        type: 'string'
      }
    },
    minimumContentWidth: {
      type   : 'integer',
      default: 3,
      minimum: 3
    },
    useEastAsianWidth: {
      type   : 'boolean',
      default: false
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
