import { CompositeDisposable } from "atom";
import { TableEditor, options, Alignment } from "@susisu/mte-kernel";

import TextEditorInterface from "./text-editor-interface.js";

const NAMESPACE = "markdown-table-editor";
const ACTIVE_CLASS = "markdown-table-editor-active";

export default class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.editorIntf = new TextEditorInterface(this.editor, atom.config.get(`${NAMESPACE}.scopes`));
    this.tableEditor = new TableEditor(this.editorIntf);

    this.updateActiveState();

    // event subscriptions
    this.subscriptions = new CompositeDisposable();

    // editor
    this.subscriptions.add(this.editor.onDidChangeGrammar(() => {
      this.updateActiveState();
    }));
    this.subscriptions.add(this.editor.onDidAddCursor(() => {
      this.updateActiveState();
    }));
    this.subscriptions.add(this.editor.onDidRemoveCursor(() => {
      this.updateActiveState();
    }));
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(event => {
      if (!this.editorIntf.transaction
        && event.newBufferPosition.row !== event.oldBufferPosition.row) {
        this.updateActiveState();
      }
    }));
    this.subscriptions.add(this.editor.onDidStopChanging(() => {
      if (!this.editorIntf.transaction) {
        this.updateActiveState();
      }
    }));
    this.subscriptions.add(this.editorIntf.onDidFinishTransaction(() => {
      this.updateActiveState();
    }));
    this.subscriptions.add(this.editor.getBuffer().onWillSave(() => {
      if (atom.config.get(`${NAMESPACE}.formatOnSave`)) {
        this.formatAll();
      }
    }));

    // config
    this.subscriptions.add(atom.config.observe(`${NAMESPACE}.scopes`, scopes => {
      this.editorIntf.scopes = scopes;
      this.updateActiveState();
    }));
  }

  updateActiveState() {
    const isActive = !this.editor.hasMultipleCursors()
      && this.tableEditor.cursorIsInTable(this.getOptions());
    if (isActive) {
      this.editor.element.classList.add(ACTIVE_CLASS);
    }
    else {
      this.editor.element.classList.remove(ACTIVE_CLASS);
      this.tableEditor.resetSmartCursor();
    }
  }

  getOptions() {
    const configOpt = {
      scope: this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition())
    };
    return options({
      leftMarginChars  : new Set(atom.config.get(`${NAMESPACE}.leftMarginChars`, configOpt)),
      formatType       : atom.config.get(`${NAMESPACE}.formatType`, configOpt),
      minDelimiterWidth: atom.config.get(`${NAMESPACE}.minDelimiterWidth`, configOpt),
      defaultAlignment : atom.config.get(`${NAMESPACE}.defaultAlignment`, configOpt),
      headerAlignment  : atom.config.get(`${NAMESPACE}.headerAlignment`, configOpt),
      smartCursor      : atom.config.get(`${NAMESPACE}.smartCursor`, configOpt),
      textWidthOptions : {
        normalize      : atom.config.get(`${NAMESPACE}.normalize`, configOpt),
        wideChars      : new Set(atom.config.get(`${NAMESPACE}.wideChars`, configOpt)),
        narrowChars    : new Set(atom.config.get(`${NAMESPACE}.narrowChars`, configOpt)),
        ambiguousAsWide: atom.config.get(`${NAMESPACE}.ambiguousAsWide`, configOpt)
      }
    });
  }

  format() {
    this.tableEditor.format(this.getOptions());
  }

  formatAll() {
    this.tableEditor.formatAll(this.getOptions());
  }

  escape() {
    this.tableEditor.escape(this.getOptions());
  }

  alignLeft() {
    this.tableEditor.alignColumn(Alignment.LEFT, this.getOptions());
  }

  alignRight() {
    this.tableEditor.alignColumn(Alignment.RIGHT, this.getOptions());
  }

  alignCenter() {
    this.tableEditor.alignColumn(Alignment.CENTER, this.getOptions());
  }

  alignNone() {
    this.tableEditor.alignColumn(Alignment.NONE, this.getOptions());
  }

  selectCell() {
    this.tableEditor.selectCell(this.getOptions());
  }

  moveLeft() {
    this.tableEditor.moveFocus(0, -1, this.getOptions());
  }

  moveRight() {
    this.tableEditor.moveFocus(0, 1, this.getOptions());
  }

  moveUp() {
    this.tableEditor.moveFocus(-1, 0, this.getOptions());
  }

  moveDown() {
    this.tableEditor.moveFocus(1, 0, this.getOptions());
  }

  nextCell() {
    this.tableEditor.nextCell(this.getOptions());
  }

  previousCell() {
    this.tableEditor.previousCell(this.getOptions());
  }

  nextRow() {
    this.tableEditor.nextRow(this.getOptions());
  }

  insertRow() {
    this.tableEditor.insertRow(this.getOptions());
  }

  deleteRow() {
    this.tableEditor.deleteRow(this.getOptions());
  }

  moveRowUp() {
    this.tableEditor.moveRow(-1, this.getOptions());
  }

  moveRowDown() {
    this.tableEditor.moveRow(1, this.getOptions());
  }

  insertColumn() {
    this.tableEditor.insertColumn(this.getOptions());
  }

  deleteColumn() {
    this.tableEditor.deleteColumn(this.getOptions());
  }

  moveColumnLeft() {
    this.tableEditor.moveColumn(-1, this.getOptions());
  }

  moveColumnRight() {
    this.tableEditor.moveColumn(1, this.getOptions());
  }

  destroy() {
    this.subscriptions.dispose();
    this.editorIntf.destroy();
  }
}
