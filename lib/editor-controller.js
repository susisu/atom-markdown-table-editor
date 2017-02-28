'use babel';

import { CompositeDisposable, Point, Range } from 'atom';

class TableCell {
  constructor(raw, content) {
    this.raw     = raw;
    this.content = content;
  }

  copy() {
    return new TableCell(this.raw, this.content);
  }
}

class TableRow {
  constructor(cells, margin) {
    this.cells  = cells;
    this.margin = margin;
  }

  copy() {
    return new TableCell(
      this.cells.map(cell => cell.copy()),
      this.margin
    );
  }
}

class Table {
  constructor(rows, range) {
    this.rows  = rows;
    this.range = range;
  }

  copy() {
    return new Table(
      this.rows.map(row => row.copy()),
      this.range.copy()
    );
  }
}

export default class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.activeGrammars = atom.config.get('markdown-table-editor.grammars');

    this.updateView();

    this.editorSub = new CompositeDisposable();

    this.editorSub.add(this.editor.onDidChangeGrammar(() => {
      this.updateView();
    }));

    this.editorSub.add(this.editor.onDidAddCursor(() => {
      this.updateView();
    }));
    this.editorSub.add(this.editor.onDidRemoveCursor(() => {
      this.updateView();
    }));
    this.editorSub.add(this.editor.onDidChangeCursorPosition(event => {
      if (event.newBufferPosition.row !== event.oldBufferPosition.row) {
        this.updateView();
      }
    }));
    this.editorSub.add(this.editor.onDidStopChanging(() => {
      this.updateView();
    }));

    this.configSub = new CompositeDisposable();
    this.configSub.add(atom.config.observe(
      'markdown-table-editor.grammars',
      grammars => {
        this.activeGrammars = grammars;
        this.updateView();
      }
    ));
  }

  isActiveGrammar() {
    const grammar = this.editor.getGrammar().scopeName;
    return this.activeGrammars.indexOf(grammar) >= 0;
  }

  isInTable() {
    if (this.editor.hasMultipleCursors()) {
      return false;
    }
    const pos  = this.editor.getCursorBufferPosition();
    const line = this.editor.lineTextForBufferRow(pos.row);
    return line.trimLeft()[0] === '|';
  }

  updateView() {
    if (this.isActiveGrammar() && this.isInTable()) {
      this.editor.element.classList.add('markdown-table-editor-active');
    }
    else {
      this.editor.element.classList.remove('markdown-table-editor-active');
    }
  }

  findTable() {
    if (!this.isInTable()) {
      return undefined;
    }
    const pos    = this.editor.getCursorBufferPosition();
    const maxRow = this.editor.getLineCount() - 1;

    const rows = [];
    const range = new Range(
      new Point(pos.row, 0),
      new Point(pos.row, 0)
    );
    const focus = new Point(0, 0);

    {
      const line = this.editor.lineTextForBufferRow(pos.row);
      const row = readTableRow(line);
      if (!row) {
        return undefined;
      }
      rows.push(row);
      range.end.column = line.length;
      focus.column     = getColumnIndex(row, pos.column);
    }

    for (let r = pos.row - 1; r >= 0; r--) {
      const line = this.editor.lineTextForBufferRow(r);
      const row = readTableRow(line);
      if (!row) {
        break;
      }
      rows.unshift(row);
      range.start.row = r;
    }

    for (let r = pos.row + 1; r <= maxRow; r++) {
      const line = this.editor.lineTextForBufferRow(r);
      const row = readTableRow(line);
      if (!row) {
        break;
      }
      rows.push(row);
      range.end.row    = r;
      range.end.column = line.length;
    }

    focus.row = pos.row - range.start.row;

    return { table: new Table(rows, range), focus };
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
    this.editorSub.dispose();
    this.configSub.dispose();
  }
}

function readBackquotes(str) {
  let i = 0;
  for (; i < str.length; i++) {
    if (str[i] !== '`') {
      break;
    }
  }
  return [str.substr(0, i), str.substr(i)];
}

function splitCells(str) {
  const cells = [];
  let rest = str;
  let buf  = '';
  while (rest !== '') {
    switch (rest[0]) {
    case '`':
      {
        const start = readBackquotes(rest);
        const quote = start[0];
        let rest1   = start[1];
        let content = '';
        let closed  = false;
        while (rest1 !== '') {
          if (rest1[0] === '`') {
            const end = readBackquotes(rest1);
            if (end[0].length === quote.length) {
              closed = true;
              rest1  = end[1];
              break;
            }
            else {
              content += end[0];
              rest1    = end[1];
            }
          }
          else {
            content += rest1[0];
            rest1    = rest1.substr(1);
          }
        }
        if (closed) {
          buf += quote + content + quote;
          rest = rest1;
        }
        else {
          buf += '`';
          rest = rest.substr(1);
        }
      }
      break;
    case '\\':
      if (rest.length >= 2) {
        buf += rest.substr(0, 2);
        rest = rest.substr(2);
      }
      else {
        buf += '\\';
        rest = rest.substr(1);
      }
      break;
    case '|':
      cells.push(buf);
      buf  = '';
      rest = rest.substr(1);
      break;
    default:
      buf += rest[0];
      rest = rest.substr(1);
    }
  }
  cells.push(buf);
  return cells;
}

function readTableRow(line) {
  if (line.trimLeft()[0] !== '|') {
    return undefined;
  }
  let rawCells = splitCells(line);
  const margin = rawCells[0].length;
  rawCells = rawCells[rawCells.length - 1].trim() === ''
    ? rawCells.slice(1, rawCells.length - 1)
    : rawCells.slice(1);
  const cells = rawCells.map(cell => new TableCell(cell, cell.trim()));
  return new TableRow(cells, margin);
}

function getColumnIndex(row, posColumn) {
  if (row.margin + 1 > posColumn) {
    return -1;
  }
  const ws = row.cells.map(cell => cell.raw.length);
  let c = row.margin + 1;
  let i = 0;
  for (; i < ws.length; i++) {
    c += ws[i] + 1;
    if (c > posColumn) {
      break;
    }
  }
  return i;
}