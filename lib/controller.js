'use babel';

import { CompositeDisposable } from 'atom';

import EditorController from './editor-controller.js';

const COMMAND_TARGET = 'atom-text-editor:not(.mini):not(.autocomplete-active)'
  + '.markdown-table-editor-active';
const NAMESPACE = 'markdown-table-editor';

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
      [`${NAMESPACE}:format`]: this.handleCommand(editorCtrler => {
        editorCtrler.format();
      }),
      [`${NAMESPACE}:escape`]: this.handleCommand(editorCtrler => {
        editorCtrler.escape();
      }),
      [`${NAMESPACE}:align-left`]: this.handleCommand(editorCtrler => {
        editorCtrler.alignLeft();
      }),
      [`${NAMESPACE}:align-right`]: this.handleCommand(editorCtrler => {
        editorCtrler.alignRight();
      }),
      [`${NAMESPACE}:align-center`]: this.handleCommand(editorCtrler => {
        editorCtrler.alignCenter();
      }),
      [`${NAMESPACE}:align-default`]: this.handleCommand(editorCtrler => {
        editorCtrler.alignDefault();
      }),
      [`${NAMESPACE}:select-cell`]: this.handleCommand(editorCtrler => {
        editorCtrler.selectCell();
      }),
      [`${NAMESPACE}:move-left`]: this.handleCommand(editorCtrler => {
        editorCtrler.moveLeft();
      }),
      [`${NAMESPACE}:move-right`]: this.handleCommand(editorCtrler => {
        editorCtrler.moveRight();
      }),
      [`${NAMESPACE}:move-up`]: this.handleCommand(editorCtrler => {
        editorCtrler.moveUp();
      }),
      [`${NAMESPACE}:move-down`]: this.handleCommand(editorCtrler => {
        editorCtrler.moveDown();
      }),
      [`${NAMESPACE}:next-cell`]: this.handleCommand(editorCtrler => {
        editorCtrler.nextCell();
      }),
      [`${NAMESPACE}:previous-cell`]: this.handleCommand(editorCtrler => {
        editorCtrler.previousCell();
      }),
      [`${NAMESPACE}:next-row`]: this.handleCommand(editorCtrler => {
        editorCtrler.nextRow();
      }),
      [`${NAMESPACE}:insert-row`]: this.handleCommand(editorCtrler => {
        editorCtrler.insertRow();
      }),
      [`${NAMESPACE}:delete-row`]: this.handleCommand(editorCtrler => {
        editorCtrler.deleteRow();
      }),
      [`${NAMESPACE}:insert-column`]: this.handleCommand(editorCtrler => {
        editorCtrler.insertColumn();
      }),
      [`${NAMESPACE}:delete-column`]: this.handleCommand(editorCtrler => {
        editorCtrler.deleteColumn();
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

  handleCommand(callback) {
    return event => {
      if (this.editorCtrlers.has(event.currentTarget)) {
        callback.call(undefined, this.editorCtrlers.get(event.currentTarget));
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
