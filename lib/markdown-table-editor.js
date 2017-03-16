'use babel';

import Controller from './controller.js';

export default {
  config: {
    grammars: {
      order  : 1,
      type   : 'array',
      default: ['source.gfm', 'text.md'],
      items  : {
        type: 'string'
      }
    },
    minimumContentWidth: {
      order  : 2,
      type   : 'integer',
      default: 3,
      minimum: 1
    },
    useEastAsianWidth: {
      order      : 3,
      type       : 'boolean',
      default    : false,
      description: 'Compute character width'
        + ' based on the Unicode East Asian Width specification'
    },
    smartCursor: {
      order  : 4,
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
