'use babel';

import Controller from './controller.js';

export default {
  config: {
    grammars: {
      order      : 1,
      type       : 'array',
      items      : { type: 'string' },
      default    : ['source.gfm', 'text.md'],
      description: 'List of scopes in which the table editor will be enabled'
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
    ambiguousAsWide: {
      order      : 4,
      title      : 'Treat East Asian Ambiguous Characters As Wide',
      type       : 'boolean',
      default    : true,
      description: 'When "Use East Asian Width" is enabled,'
        + ' Unicode East Asian Ambiguous characters are treated as wide'
    },
    smartCursor: {
      order      : 5,
      type       : 'boolean',
      default    : false,
      description: 'Become more sensible to remember column'
        + ' where the cursor will come back on "Next Row" command'
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
