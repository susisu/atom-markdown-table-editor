'use babel';

import EditorController from './editor-controller.js';

export default class Controller {
  constructor() {
    this.editorCtrlers = new Set();

    this.editorsSub = atom.workspace.observeTextEditors(editor => {
      const editorCtrler = new EditorController(editor);
      this.editorCtrlers.add(editorCtrler);

      const destroySub = editor.onDidDestroy(() => {
        destroySub.dispose();

        editorCtrler.destroy();
        this.editorCtrlers.delete(editorCtrler);
      });
    });
  }

  destroy() {
    this.editorsSub.dispose();

    for (const editorCtrler of this.editorCtrlers) {
      editorCtrler.destroy();
    }
  }
}
