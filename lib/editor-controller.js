'use babel';

import { CompositeDisposable, Point, Range } from 'atom';
import { Table, TableRow, TableCell, Alignment } from './table.js';

const NAMESPACE = 'markdown-table-editor';

export default class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.activeGrammars = atom.config.get(`${NAMESPACE}.grammars`);

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
      `${NAMESPACE}.grammars`,
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
    return isTableRow(line);
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
    const pos    = this.editor.getCursorBufferPosition();
    const maxRow = this.editor.getLineCount() - 1;

    const range = new Range(
      new Point(pos.row, 0),
      new Point(pos.row, 0)
    );
    const lines = [];
    {
      const line = this.editor.lineTextForBufferRow(pos.row);
      if (!isTableRow(line)) {
        return undefined;
      }
      range.end.column = line.length;
      lines.push(line);
    }
    for (let r = pos.row - 1; r >= 0; r--) {
      const line = this.editor.lineTextForBufferRow(r);
      if (!isTableRow(line)) {
        break;
      }
      range.start.row = r;
      lines.unshift(line);
    }

    for (let r = pos.row + 1; r <= maxRow; r++) {
      const line = this.editor.lineTextForBufferRow(r);
      if (!isTableRow(line)) {
        break;
      }
      range.end.row    = r;
      range.end.column = line.length;
      lines.push(line);
    }

    const table = Table.read(lines);
    const focus = table.computeFocus(range.start, pos);

    const originalText = lines.join('\n');

    return { table, range, focus, originalText };
  }

  format() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  escape() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // format table
    const formatted = completed.table.format({ minContentWidth, useEAW });

    // apply to the editor
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
    const newPos = range.end.copy();
    if (completed.alignmentInserted) {
      newPos.row += 1;
    }
    newPos.row   += 1;
    newPos.column = 0;
    if (newPos.row > this.editor.getLineCount() - 1) {
      this.editor.setCursorBufferPosition(newPos);
      this.editor.insertNewline();
    }
    else {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  align(alignment) {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // set alignment
    completed.table.setAlignment(
      focus.pos.column,
      alignment,
      { minContentWidth }
    );

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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  alignLeft() {
    this.align(Alignment.LEFT);
  }

  alignRight() {
    this.align(Alignment.RIGHT);
  }

  alignCenter() {
    this.align(Alignment.CENTER);
  }

  alignDefault() {
    this.align(Alignment.DEFAULT);
  }

  selectCell() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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

  move(direction) {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move
    newFocus.pos.row    += direction.row;
    newFocus.pos.column += direction.column;
    if (direction.row !== 0) {
      if (newFocus.pos.row === 1) {
        newFocus.pos.row += direction.row > 0 ? 1 : -1;
      }
      if (newFocus.pos.row < 0) {
        newFocus.pos.row = 0;
      }
      if (newFocus.pos.row > completed.table.height - 1) {
        if (completed.table.height <= 2) {
          newFocus.pos.row = 0;
        }
        else {
          newFocus.pos.row = completed.table.height - 1;
        }
      }
    }
    if (direction.column !== 0) {
      if (newFocus.pos.column < 0) {
        newFocus.pos.column = 0;
      }
      if (newFocus.pos.column > completed.table.headerWidth - 1) {
        newFocus.pos.column = completed.table.headerWidth - 1;
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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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

  moveLeft() {
    this.move(new Point(0, -1));
  }

  moveRight() {
    this.move(new Point(0, 1));
  }

  moveUp() {
    this.move(new Point(-1, 0));
  }

  moveDown() {
    this.move(new Point(1, 0));
  }

  nextCell() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move to next cell
    if (newFocus.pos.row === 1) {
      if (newFocus.pos.column < completed.table.headerWidth - 1) {
        newFocus.pos.column += 1;
      }
      else {
        newFocus.pos.row   += 1;
        newFocus.pos.column = 0;
      }
    }
    else {
      if (newFocus.pos.column <= completed.table.headerWidth - 1) {
        newFocus.pos.column += 1;
      }
      else {
        newFocus.pos.row   += newFocus.pos.row === 0 ? 2 : 1;
        newFocus.pos.column = 0;
      }
    }

    // add empty row if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      completed.table.rows.push(new TableRow(
        new Array(completed.table.headerWidth).fill()
          .map(() => new TableCell('')),
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
    if (newFocus.pos.column >= formatted.table.headerWidth) {
      formatted.table.rows[newFocus.pos.row].marginRight = ' ';
      newFocus.offset = 1;
    }

    // apply to the editor
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

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
        newFocus.pos.column = completed.table.headerWidth - 1;
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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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

  nextRow() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    // move to next row
    if (newFocus.pos.row === 0) {
      newFocus.pos.row += 2;
    }
    else {
      newFocus.pos.row += 1;
    }
    newFocus.pos.column = 0;

    // add empty row if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      completed.table.rows.push(new TableRow(
        new Array(completed.table.headerWidth).fill()
          .map(() => new TableCell('')),
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

    // apply to the editor
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    if (newFocus.pos.row <= 1) {
      newFocus.pos.row = 2;
    }
    newFocus.pos.column = 0;

    // insert empty row
    completed.table.rows.splice(newFocus.pos.row, 0, new TableRow(
      new Array(completed.table.headerWidth).fill()
        .map(() => new TableCell('')),
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
    const text = formatted.table.toText();
    this.editor.setTextInBufferRange(range, text);
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  deleteRow() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    if (newFocus.pos.row <= 1) {
      newFocus.pos.row = 2;
    }
    if (newFocus.pos.column < 0
      || completed.table.headerWidth <= newFocus.pos.column) {
      newFocus.pos.column = 0;
    }

    // delete row
    completed.table.rows.splice(newFocus.pos.row, 1);

    // move up if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      newFocus.pos.row = newFocus.pos.row === 2
        ? completed.table.height - 2
        : completed.table.height - 1;
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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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

  insertColumn() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table = info.table;
    const range = info.range;
    const focus = info.focus;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    if (newFocus.pos.row === 1) {
      newFocus.pos.row = 0;
    }
    if (newFocus.pos.column < 0) {
      newFocus.pos.column = 0;
    }

    // insert empty column
    for (let i = 0; i < completed.table.height; i++) {
      completed.table.rows[i].cells.splice(
        newFocus.pos.column,
        0,
        i === 1
          ? TableCell.newAlignmentCell(Alignment.DEFAULT, minContentWidth)
          : new TableCell('')
      );
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
    const text = formatted.table.toText();
    this.editor.setTextInBufferRange(range, text);
    const newPos = formatted.table.computePosition(range.start, newFocus);
    if (newPos) {
      this.editor.setCursorBufferPosition(newPos);
    }
  }

  deleteColumn() {
    // find table
    const info = this.findTable();
    if (!info) {
      return;
    }
    const table        = info.table;
    const range        = info.range;
    const focus        = info.focus;
    const originalText = info.originalText;

    // options
    const minContentWidth = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const useEAW          = atom.config.get(`${NAMESPACE}.useEastAsianWidth`);

    // complete table
    const completed = table.complete({ minContentWidth });

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    if (newFocus.pos.row === 1) {
      newFocus.pos.row = 0;
    }
    if (newFocus.pos.column < 0) {
      newFocus.pos.column = 0;
    }
    if (newFocus.pos.column >= completed.table.headerWidth) {
      newFocus.pos.column = completed.table.headerWidth - 1;
    }

    // insert empty column
    for (let i = 0; i < completed.table.height; i++) {
      completed.table.rows[i].cells.splice(newFocus.pos.column, 1);
    }

    // insert empty column if table has no columns
    if (completed.table.headerWidth === 0) {
      for (let i = 0; i < completed.table.height; i++) {
        completed.table.rows[i].cells.push(
          i === 1
            ? TableCell.newAlignmentCell(Alignment.DEFAULT, minContentWidth)
            : new TableCell('')
        );
      }
    }

    // move left if new focus row is out
    if (newFocus.pos.column >= completed.table.headerWidth) {
      newFocus.pos.column = completed.table.headerWidth - 1;
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
    const text = formatted.table.toText();
    if (text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
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

  destroy() {
    this.editorSub.dispose();
    this.configSub.dispose();
  }
}

function isTableRow(line) {
  return line.trimLeft()[0] === '|';
}
