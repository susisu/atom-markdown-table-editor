'use babel';

import { CompositeDisposable } from 'atom';

import EditorController from './editor-controller.js';

export default class Controller {
  constructor() {
    this.editorCtrlers = new Map();

    this.editorsSub = new CompositeDisposable();
    this.editorsSub.add(atom.workspace.observeTextEditors(editor => {
      this.addEditor(editor);
    }));
    this.editorsSub.add(atom.workspace.onDidDestroyPaneItem(item => {
      this.removeEditor(item);
    }));
  }

  addEditor(editor) {
    const editorCtrler = new EditorController(editor);
    this.editorCtrlers.set(editor, editorCtrler);
  }

  removeEditor(editor) {
    this.editorCtrlers.delete(editor);
  }

  destroy() {
    this.editorsSub.dispose();

    for (const editorCtrler of this.editorCtrlers.values()) {
      editorCtrler.destroy();
    }
  }
}
