import Controller from './controller.js';

const NAMESPACE = 'markdown-table-editor';

class MarkdownTableEditor {
  constructor() {
    this.controller = null;
  }

  activate() {
    this.controller = new Controller();
    // migrate old config if edited
    const grammars = atom.config.get(`${NAMESPACE}.grammars`);
    if (grammars) {
      atom.config.set(`${NAMESPACE}.scopes`, grammars);
      atom.config.unset(`${NAMESPACE}.grammars`);
    }
  }

  deactivate() {
    this.controller.destroy();
  }

  serialize() {
  }
}

module.exports = new MarkdownTableEditor();
