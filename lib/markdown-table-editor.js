'use babel';

import Controller from './controller.js';

class MarkdownTableEditor {
  constructor() {
    this.controller = null;
  }

  activate() {
    this.controller = new Controller();
  }

  deactivate() {
    this.controller.destroy();
  }

  serialize() {
  }
}

export default new MarkdownTableEditor();
