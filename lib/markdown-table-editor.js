import Controller from "./controller.js";

const NAMESPACE = "markdown-table-editor";

class MarkdownTableEditor {
  constructor() {
    this.controller = null;
  }

  activate() {
    this.controller = new Controller();
    // migrate old configurations
    const grammars = atom.config.get(`${NAMESPACE}.grammars`);
    if (grammars !== undefined) {
      atom.config.set(`${NAMESPACE}.scopes`, grammars);
      atom.config.unset(`${NAMESPACE}.grammars`);
    }
    const minimumContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    if (minimumContentWidth !== undefined) {
      atom.config.set(`${NAMESPACE}.minDelimiterWidth`, minimumContentWidth);
      atom.config.unset(`${NAMESPACE}.minimumContentWidth`);
    }
    const eawAmbiguousAsWide = atom.config.get(`${NAMESPACE}.eawAmbiguousAsWide`);
    if (eawAmbiguousAsWide !== undefined) {
      atom.config.set(`${NAMESPACE}.ambiguousAsWide`, eawAmbiguousAsWide);
      atom.config.unset(`${NAMESPACE}.eawAmbiguousAsWide`);
    }
    const alwaysWideChars = atom.config.get(`${NAMESPACE}.alwaysWideChars`);
    if (alwaysWideChars !== undefined) {
      atom.config.set(`${NAMESPACE}.wideChars`, alwaysWideChars);
      atom.config.unset(`${NAMESPACE}.alwaysWideChars`);
    }
    const alwaysNarrowChars = atom.config.get(`${NAMESPACE}.alwaysNarrowChars`);
    if (alwaysNarrowChars !== undefined) {
      atom.config.set(`${NAMESPACE}.narrowChars`, alwaysNarrowChars);
      atom.config.unset(`${NAMESPACE}.alwaysNarrowChars`);
    }
  }

  deactivate() {
    this.controller.destroy();
  }

  serialize() {
  }
}

module.exports = new MarkdownTableEditor();
