import { FormatType } from "@susisu/mte-kernel";

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
    if (grammars) {
      atom.config.set(`${NAMESPACE}.scopes`, grammars);
      atom.config.unset(`${NAMESPACE}.grammars`);
    }
    const formatType = atom.config.get(`${NAMESPACE}.formatType`);
    if (formatType === "whole") {
      atom.config.set(`${NAMESPACE}.formatType`, FormatType.NORMAL);
    }
    if (formatType === "row") {
      atom.config.set(`${NAMESPACE}.formatType`, FormatType.WEAK);
    }
    const minimumContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    if (minimumContentWidth) {
      atom.config.set(`${NAMESPACE}.minDelimiterWidth`, minimumContentWidth);
      atom.config.unset(`${NAMESPACE}.minimumContentWidth`);
    }
    const eawAmbiguousAsWide = atom.config.get(`${NAMESPACE}.eawAmbiguousAsWide`);
    if (eawAmbiguousAsWide) {
      atom.config.set(`${NAMESPACE}.ambiguousAsWide`, eawAmbiguousAsWide);
      atom.config.unset(`${NAMESPACE}.eawAmbiguousAsWide`);
    }
    const alwaysWideChars = atom.config.get(`${NAMESPACE}.alwaysWideChars`);
    if (alwaysWideChars) {
      atom.config.set(`${NAMESPACE}.wideChars`, alwaysWideChars);
      atom.config.unset(`${NAMESPACE}.alwaysWideChars`);
    }
    const alwaysNarrowChars = atom.config.get(`${NAMESPACE}.alwaysNarrowChars`);
    if (alwaysNarrowChars) {
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
