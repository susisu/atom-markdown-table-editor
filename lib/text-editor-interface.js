import { Emitter } from "atom";
import { Point, ITextEditor } from "@susisu/mte-kernel";

export default class TextEditorInterface extends ITextEditor {
  constructor(textEditor, scopes) {
    super();
    this.textEditor  = textEditor;
    this.textBuffer  = textEditor.getBuffer();
    this.scopes      = scopes;
    this.transaction = false;
    this.emitter     = new Emitter();
  }

  getCursorPosition() {
    const _pos = this.textEditor.getCursorBufferPosition();
    return new Point(_pos.row, _pos.column);
  }

  setCursorPosition(pos) {
    this.textEditor.setCursorBufferPosition([pos.row, pos.column]);
  }

  setSelectionRange(range) {
    this.textEditor.setSelectedBufferRange([
      [range.start.row, range.start.column],
      [range.end.row, range.end.column]
    ]);
  }

  getLastRow() {
    return this.textBuffer.getLastRow();
  }

  acceptsTableEdit(row) {
    const sd = this.textEditor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray();
    for (const scope of this.scopes) {
      if (sd.indexOf(scope) >= 0) {
        return true;
      }
    }
    return false;
  }

  getLine(row) {
    return this.textBuffer.lineForRow(row);
  }

  insertLine(row, line) {
    const lastRow = this.textBuffer.getLastRow();
    if (row > lastRow) {
      const le = this.textBuffer.lineEndingForRow(lastRow);
      this.textBuffer.append("\n" + line + le, { normalizeLineEndings: true });
    }
    else {
      this.textBuffer.insert([row, 0], line + "\n", { normalizeLineEndings: true });
    }
  }

  deleteLine(row) {
    this.textBuffer.deleteRow(row);
  }

  replaceLines(startRow, endRow, lines) {
    const le = this.textBuffer.lineEndingForRow(endRow - 1);
    this.textBuffer.setTextInRange(
      [[startRow, 0], [endRow, 0]],
      lines.join("\n") + le,
      { normalizeLineEndings: true }
    );
  }

  transact(func) {
    this.transaction = true;
    this.textBuffer.transact(() => { func(); });
    this.transaction = false;
    this.emitter.emit("did-finish-transaction");
  }

  onDidFinishTransaction(func) {
    return this.emitter.on("did-finish-transaction", func);
  }

  destroy() {
    this.emitter.dispose();
  }
}
