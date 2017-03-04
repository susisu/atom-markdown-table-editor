'use babel';

import { CompositeDisposable } from 'atom';

import EditorController from './editor-controller.js';

const COMMAND_TARGET = 'atom-text-editor:not(.mini):not(.autocomplete-active)'
  + '.markdown-table-editor-active';

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

    this.commandsSub = new CompositeDisposable();
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:format',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.format();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:escape',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.escape();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:align-left',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.alignLeft();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:align-right',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.alignRight();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:align-center',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.alignCenter();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:align-default',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.alignDefault();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:next-cell',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.nextCell();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:previous-cell',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.previousCell();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:next-row',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.nextRow();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:insert-row',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.insertRow();
        }
      }
    ));
    this.commandsSub.add(atom.commands.add(
      COMMAND_TARGET,
      'markdown-table-editor:insert-column',
      event => {
        if (this.editorCtrlers.has(event.currentTarget)) {
          const editorCtrler = this.editorCtrlers.get(event.currentTarget);
          editorCtrler.insertColumn();
        }
      }
    ));
  }

  addEditor(editor) {
    const editorCtrler = new EditorController(editor);
    this.editorCtrlers.set(editor.element, editorCtrler);
  }

  removeEditor(editor) {
    this.editorCtrlers.delete(editor.element);
  }

  destroy() {
    this.editorsSub.dispose();
    this.commandsSub.dispose();

    for (const editorCtrler of this.editorCtrlers.values()) {
      editorCtrler.destroy();
    }
  }
}
