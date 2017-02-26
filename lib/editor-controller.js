'use babel';

import { CompositeDisposable } from 'atom';

export default class EditorController {
  constructor(editor) {
    this.editor = editor;

    this.updateView();

    this.cursorsSub = new CompositeDisposable();
    this.cursorsSub.add(this.editor.onDidAddCursor(() => {
      this.updateView();
    }));
    this.cursorsSub.add(this.editor.onDidRemoveCursor(() => {
      this.updateView();
    }));
    this.cursorsSub.add(this.editor.onDidChangeCursorPosition(event => {
      if (event.newBufferPosition.row !== event.oldBufferPosition.row) {
        this.updateView();
      }
    }));
    this.cursorsSub.add(this.editor.onDidStopChanging(() => {
      this.updateView();
    }));
  }

  isInTable() {
    // TODO: check grammar
    if (this.editor.hasMultipleCursors()) {
      return false;
    }
    const pos  = this.editor.getCursorBufferPosition();
    const line = this.editor.lineTextForBufferRow(pos.row);
    return line.trimLeft()[0] === '|';
  }

  updateView() {
    if (this.isInTable()) {
      this.editor.element.classList.add('markdown-table-editor-active');
    }
    else {
      this.editor.element.classList.remove('markdown-table-editor-active');
    }
  }

  nextCell() {
    if (!this.isInTable()) {
      return;
    }
    // TODO
  }

  previousCell() {
    if (!this.isInTable()) {
      return;
    }
    // TODO
  }

  destroy() {
    this.cursorsSub.dispose();
  }
}
