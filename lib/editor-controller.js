'use babel';

import { CompositeDisposable, Point, Range } from 'atom';
import { Table, TableRow, TableCell } from './table.js';

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
    {
      const line = this.editor.lineTextForBufferRow(pos.row);
      const row  = readTableRow(line);
      if (!row) {
        return undefined;
      }
      rows.push(row);
      range.end.column = line.length;
    }
    for (let r = pos.row - 1; r >= 0; r--) {
      const line = this.editor.lineTextForBufferRow(r);
      const row  = readTableRow(line);
      if (!row) {
        break;
      }
      rows.unshift(row);
      range.start.row = r;
    }

    for (let r = pos.row + 1; r <= maxRow; r++) {
      const line = this.editor.lineTextForBufferRow(r);
      const row  = readTableRow(line);
      if (!row) {
        break;
      }
      rows.push(row);
      range.end.row    = r;
      range.end.column = line.length;
    }

    const table = new Table(rows);
    const focus = table.computeFocus(range.start, pos);

    return { table, range, focus };
  }

  format() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table = info.table;
    const range = info.range;
    const focus = info.focus;

    // options
    const minContentWidth = atom.config.get(
      'markdown-table-editor.minimumContentWidth'
    );
    const useEAW = atom.config.get(
      'markdown-table-editor.useEastAsianWidth'
    );

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }

    // format table
    const formatted = completed.table.format({ minContentWidth, useEAW });

    // compute new focus offset
    const completedFocusCell = completed.table.getCell(newFocus.pos);
    const formattedFocusCell = formatted.table.getCell(newFocus.pos);
    if (!completedFocusCell || !formattedFocusCell) {
      if (newFocus.pos.column < 0) {
        newFocus.offset = formatted.marginLeft.length;
      }
      else {
        newFocus.offset = 0;
      }
    }
    else {
      newFocus.offset = formattedFocusCell.computeRawOffset(
        completedFocusCell.computeContentOffset(newFocus.offset)
      );
    }

    // apply to the editor
    this.editor.setTextInBufferRange(range, formatted.table.toText());
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  nextCell() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table = info.table;
    const range = info.range;
    const focus = info.focus;

    // options
    const minContentWidth = atom.config.get(
      'markdown-table-editor.minimumContentWidth'
    );
    const useEAW = atom.config.get(
      'markdown-table-editor.useEastAsianWidth'
    );

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move to next cell
    if (newFocus.pos.row === 0) {
      if (newFocus.pos.column === completed.table.width - 1) {
        newFocus.pos.column += 1;
      }
      else if (newFocus.pos.column > completed.table.width - 1) {
        newFocus.pos.row   += 2;
        newFocus.pos.column = 0;
      }
      else {
        newFocus.pos.column += 1;
      }
    }
    else {
      if (newFocus.pos.column >= completed.table.width - 1) {
        newFocus.pos.row   += 1;
        newFocus.pos.column = 0;
      }
      else {
        newFocus.pos.column += 1;
      }
    }

    // add empty row if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      completed.table.rows.push(new TableRow(
        new Array(completed.table.width).fill().map(() => new TableCell('')),
        '',
        ''
      ));
    }

    // format table
    const formatted = completed.table.format({ minContentWidth, useEAW });

    // compute new focus offset
    const formattedFocusCell = formatted.table.getCell(newFocus.pos);
    if (!formattedFocusCell) {
      if (newFocus.pos.column < 0) {
        newFocus.offset = formatted.marginLeft.length;
      }
      else {
        newFocus.offset = 0;
      }
    }
    else {
      newFocus.offset = formattedFocusCell.computeRawOffset(0);
    }

    // add margin if new focus column is out
    if (newFocus.pos.row === 0
      && newFocus.pos.column >= formatted.table.width) {
      formatted.table.rows[newFocus.pos.row].marginRight = ' ';
      newFocus.offset = 1;
    }

    // apply to the editor
    this.editor.setTextInBufferRange(range, formatted.table.toText());
    const select = formatted.table.computeSelectionRange(range.start, newFocus);
    if (select) {
      this.editor.setSelectedBufferRange(select);
    }
    else {
      const newPos = formatted.table.computePosition(range.start, newFocus);
      if (newPos) {
        this.editor.setCursorBufferPosition(newPos);
      }
    }
  }

  previousCell() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table = info.table;
    const range = info.range;
    const focus = info.focus;

    // options
    const minContentWidth = atom.config.get(
      'markdown-table-editor.minimumContentWidth'
    );
    const useEAW = atom.config.get(
      'markdown-table-editor.useEastAsianWidth'
    );

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move to previous cell
    if (newFocus.pos.row === 0) {
      if (newFocus.pos.column > 0) {
        newFocus.pos.column -= 1;
      }
    }
    else {
      if (newFocus.pos.column === 0) {
        newFocus.pos.row   -= newFocus.pos.row === 2 ? 2 : 1;
        newFocus.pos.column = completed.table.width - 1;
      }
      else {
        newFocus.pos.column -= 1;
      }
    }

    // format table
    const formatted = completed.table.format({ minContentWidth, useEAW });

    // compute new focus offset
    const formattedFocusCell = formatted.table.getCell(newFocus.pos);
    if (!formattedFocusCell) {
      if (newFocus.pos.column < 0) {
        newFocus.offset = formatted.marginLeft.length;
      }
      else {
        newFocus.offset = 0;
      }
    }
    else {
      newFocus.offset = formattedFocusCell.computeRawOffset(0);
    }

    // apply to the editor
    this.editor.setTextInBufferRange(range, formatted.table.toText());
    const select = formatted.table.computeSelectionRange(range.start, newFocus);
    if (select) {
      this.editor.setSelectedBufferRange(select);
    }
    else {
      const newPos = formatted.table.computePosition(range.start, newFocus);
      if (newPos) {
        this.editor.setCursorBufferPosition(newPos);
      }
    }
  }

  insertRow() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table = info.table;
    const range = info.range;
    const focus = info.focus;

    // options
    const minContentWidth = atom.config.get(
      'markdown-table-editor.minimumContentWidth'
    );
    const useEAW = atom.config.get(
      'markdown-table-editor.useEastAsianWidth'
    );

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move to next row
    if (newFocus.pos.row === 0) {
      newFocus.pos.row   += 2;
      newFocus.pos.column = 0;
    }
    else {
      newFocus.pos.row   += 1;
      newFocus.pos.column = 0;
    }

    // add empty row
    completed.table.rows.splice(newFocus.pos.row, 0, new TableRow(
      new Array(completed.table.width).fill().map(() => new TableCell('')),
      '',
      ''
    ));

    // format table
    const formatted = completed.table.format({ minContentWidth, useEAW });

    // compute new focus offset
    const formattedFocusCell = formatted.table.getCell(newFocus.pos);
    if (!formattedFocusCell) {
      if (newFocus.pos.column < 0) {
        newFocus.offset = formatted.marginLeft.length;
      }
      else {
        newFocus.offset = 0;
      }
    }
    else {
      newFocus.offset = formattedFocusCell.computeRawOffset(0);
    }

    // apply to the editor
    this.editor.setTextInBufferRange(range, formatted.table.toText());
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
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
  const marginLeft = rawCells[0];
  let marginRight;
  if (rawCells[rawCells.length - 1].trim() === '') {
    marginRight = rawCells[rawCells.length - 1];
    rawCells    = rawCells.slice(1, rawCells.length - 1);
  }
  else {
    marginRight = '';
    rawCells    = rawCells.slice(1);
  }
  const cells = rawCells.map(cell => new TableCell(cell));
  return new TableRow(cells, marginLeft, marginRight);
}
