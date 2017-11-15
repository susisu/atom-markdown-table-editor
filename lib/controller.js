import { CompositeDisposable } from 'atom';

import EditorController from './editor-controller.js';

const COMMAND_TARGET = 'atom-text-editor:not(.mini):not(.autocomplete-active)';
const EDITOR_COMMAND_TARGET = COMMAND_TARGET + '.markdown-table-editor-active';
const NAMESPACE = 'markdown-table-editor';

const FORMAT_TYPES = ['whole', 'row'];

export default class Controller {
  constructor() {
    this.editorCtrlers = new Map();

    // event subscriptions
    this.subscriptions = new CompositeDisposable();

    // editor
    this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
      this.addEditor(editor);
    }));
    this.subscriptions.add(atom.workspace.onDidDestroyPaneItem(item => {
      this.removeEditor(item);
    }));

    // commands
    this.subscriptions.add(atom.commands.add(COMMAND_TARGET, {
      [`${NAMESPACE}:switch-format-type`]: () => {
        this.switchFormatType();
      }
    }));
    this.subscriptions.add(atom.commands.add(EDITOR_COMMAND_TARGET, {
      [`${NAMESPACE}:format`]: this.editorCommand(editorCtrler => {
        editorCtrler.format();
      }),
      [`${NAMESPACE}:escape`]: this.editorCommand(editorCtrler => {
        editorCtrler.escape();
      }),
      [`${NAMESPACE}:align-left`]: this.editorCommand(editorCtrler => {
        editorCtrler.alignLeft();
      }),
      [`${NAMESPACE}:align-right`]: this.editorCommand(editorCtrler => {
        editorCtrler.alignRight();
      }),
      [`${NAMESPACE}:align-center`]: this.editorCommand(editorCtrler => {
        editorCtrler.alignCenter();
      }),
      [`${NAMESPACE}:align-default`]: this.editorCommand(editorCtrler => {
        editorCtrler.alignDefault();
      }),
      [`${NAMESPACE}:select-cell`]: this.editorCommand(editorCtrler => {
        editorCtrler.selectCell();
      }),
      [`${NAMESPACE}:move-left`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveLeft();
      }),
      [`${NAMESPACE}:move-right`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveRight();
      }),
      [`${NAMESPACE}:move-up`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveUp();
      }),
      [`${NAMESPACE}:move-down`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveDown();
      }),
      [`${NAMESPACE}:next-cell`]: this.editorCommand(editorCtrler => {
        editorCtrler.nextCell();
      }),
      [`${NAMESPACE}:previous-cell`]: this.editorCommand(editorCtrler => {
        editorCtrler.previousCell();
      }),
      [`${NAMESPACE}:next-row`]: this.editorCommand(editorCtrler => {
        editorCtrler.nextRow();
      }),
      [`${NAMESPACE}:insert-row`]: this.editorCommand(editorCtrler => {
        editorCtrler.insertRow();
      }),
      [`${NAMESPACE}:delete-row`]: this.editorCommand(editorCtrler => {
        editorCtrler.deleteRow();
      }),
      [`${NAMESPACE}:move-row-up`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveRowUp();
      }),
      [`${NAMESPACE}:move-row-down`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveRowDown();
      }),
      [`${NAMESPACE}:insert-column`]: this.editorCommand(editorCtrler => {
        editorCtrler.insertColumn();
      }),
      [`${NAMESPACE}:delete-column`]: this.editorCommand(editorCtrler => {
        editorCtrler.deleteColumn();
      }),
      [`${NAMESPACE}:move-column-left`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveColumnLeft();
      }),
      [`${NAMESPACE}:move-column-right`]: this.editorCommand(editorCtrler => {
        editorCtrler.moveColumnRight();
      })
    }));
  }

  addEditor(editor) {
    const editorCtrler = new EditorController(editor);
    this.editorCtrlers.set(editor.element, editorCtrler);
  }

  removeEditor(editor) {
    this.editorCtrlers.delete(editor.element);
  }

  switchFormatType() {
    const formatType = atom.config.get(`${NAMESPACE}.formatType`);
    const i = FORMAT_TYPES.indexOf(formatType);
    atom.config.set(`${NAMESPACE}.formatType`, FORMAT_TYPES[i + 1] || 'whole');
  }

  editorCommand(callback) {
    return event => {
      if (this.editorCtrlers.has(event.currentTarget)) {
        callback(this.editorCtrlers.get(event.currentTarget));
      }
    };
  }

  destroy() {
    this.subscriptions.dispose();

    for (const editorCtrler of this.editorCtrlers.values()) {
      editorCtrler.destroy();
    }
  }
}
