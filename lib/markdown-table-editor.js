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
    eawAmbiguousAsWide: {
      order      : 3,
      title      : 'Treat East Asian Ambiguous Characters As Wide',
      type       : 'boolean',
      default    : false,
      description: 'Unicode East Asian Ambiguous characters are treated as wide'
    },
    alwaysWideChars: {
      order      : 4,
      title      : 'Always Wide Characters',
      type       : 'string',
      default    : '',
      description: 'A string of characters.'
        + ' The characters listed are always treated as wide'
    },
    alwaysNarrowChars: {
      order      : 5,
      title      : 'Always Narrow Characters',
      type       : 'string',
      default    : '',
      description: 'A string of characters.'
        + ' The characters listed are always treated as narrow'
    },
    smartCursor: {
      order      : 6,
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
