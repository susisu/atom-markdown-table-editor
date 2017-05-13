'use babel';

import { CompositeDisposable, Point, Range } from 'atom';
import { Table, TableRow, TableCell, Alignment } from './table.js';

const NAMESPACE = 'markdown-table-editor';

export default class EditorController {
  constructor(editor) {
    this.editor = editor;
    this.activeGrammars = atom.config.get(`${NAMESPACE}.grammars`);

    this.smartCursorActive   = false;
    this.smartCursorColumn   = 0;
    this.smartCursorStartPos = null;
    this.smartCursorFocusPos = null;

    this.updateView(this.isActive());

    // event subscriptions
    this.subscriptions = new CompositeDisposable();

    // editor
    this.subscriptions.add(this.editor.onDidChangeGrammar(() => {
      const active = this.isActive();
      this.updateView(active);
      this.updateSmartCursor(active);
    }));
    this.subscriptions.add(this.editor.onDidAddCursor(() => {
      const active = this.isActive();
      this.updateView(active);
      this.updateSmartCursor(active);
    }));
    this.subscriptions.add(this.editor.onDidRemoveCursor(() => {
      const active = this.isActive();
      this.updateView(active);
      this.updateSmartCursor(active);
    }));
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(event => {
      if (event.newBufferPosition.row !== event.oldBufferPosition.row) {
        const active = this.isActive();
        this.updateView(active);
        this.updateSmartCursor(active);
      }
    }));
    this.subscriptions.add(this.editor.onDidStopChanging(() => {
      const active = this.isActive();
      this.updateView(active);
      this.updateSmartCursor(active);
    }));

    // config
    this.subscriptions.add(atom.config.observe(
      `${NAMESPACE}.grammars`,
      grammars => {
        this.activeGrammars = grammars;
        const active = this.isActive();
        this.updateView(active);
        this.updateSmartCursor(active);
      }
    ));
  }

  isActiveGrammar() {
    const grammar = this.editor.getGrammar().scopeName;
    return this.activeGrammars.indexOf(grammar) >= 0;
  }

  isTableRow(line) {
    return line.trimLeft()[0] === '|';
  }

  isInTable() {
    if (this.editor.hasMultipleCursors()) {
      return false;
    }
    const pos  = this.editor.getCursorBufferPosition();
    const line = this.editor.lineTextForBufferRow(pos.row);
    return this.isTableRow(line);
  }

  isActive() {
    return this.isActiveGrammar() && this.isInTable();
  }

  updateView(active) {
    if (active) {
      this.editor.element.classList.add('markdown-table-editor-active');
    }
    else {
      this.editor.element.classList.remove('markdown-table-editor-active');
    }
  }

  updateSmartCursor(active) {
    if (!active) {
      this.smartCursorActive = false;
    }
  }

  findTable() {
    if (!this.isInTable()) {
      return undefined;
    }
    const pos    = this.editor.getCursorBufferPosition();
    const maxRow = this.editor.getLastBufferRow();

    const range = new Range(
      new Point(pos.row, 0),
      new Point(pos.row, 0)
    );
    const lines = [];
    {
      const line = this.editor.lineTextForBufferRow(pos.row);
      if (!this.isTableRow(line)) {
        return undefined;
      }
      range.end.column = line.length;
      lines.push(line);
    }
    for (let r = pos.row - 1; r >= 0; r--) {
      const line = this.editor.lineTextForBufferRow(r);
      if (!this.isTableRow(line)) {
        break;
      }
      range.start.row = r;
      lines.unshift(line);
    }

    for (let r = pos.row + 1; r <= maxRow; r++) {
      const line = this.editor.lineTextForBufferRow(r);
      if (!this.isTableRow(line)) {
        break;
      }
      range.end.row    = r;
      range.end.column = line.length;
      lines.push(line);
    }

    const table = Table.read(lines);
    const focus = table.computeFocus(range.start.row, pos);

    const originalText = lines.join('\n');

    return { table, range, focus, originalText };
  }

  getOptions() {
    const minContentWidth   = atom.config.get(`${NAMESPACE}.minimumContentWidth`);
    const ambiguousAsWide   = atom.config.get(`${NAMESPACE}.eawAmbiguousAsWide`);
    const alwaysWideChars   = new Set(atom.config.get(`${NAMESPACE}.alwaysWideChars`));
    const alwaysNarrowChars = new Set(atom.config.get(`${NAMESPACE}.alwaysNarrowChars`));
    return {
      minContentWidth,
      ambiguousAsWide,
      alwaysWideChars,
      alwaysNarrowChars
    };
  }

  updateText(range, table, originalText) {
    const text = table.toText();
    if (originalText === undefined || text !== originalText) {
      this.editor.setTextInBufferRange(range, text);
    }
  }

  moveToFocus(range, table, focus) {
    const pos = table.computePosition(range.start.row, focus);
    if (pos) {
      this.editor.setCursorBufferPosition(pos);
    }
  }

  selectFocus(range, table, focus) {
    const selection = table.computeSelectionRange(range.start.row, focus);
    if (selection) {
      this.editor.setSelectedBufferRange(selection);
    }
    else {
      const pos = table.computePosition(range.start.row, focus);
      if (pos) {
        this.editor.setCursorBufferPosition(pos);
      }
    }
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }

    // format table
    const formatted = completed.table.format(options);

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
      const contentOffset = Math.min(
        completedFocusCell.computeContentOffset(newFocus.offset),
        formattedFocusCell.content.length
      );
      newFocus.offset = formattedFocusCell.computeRawOffset(contentOffset);
    }

    // apply to the editor
    this.updateText(range, formatted.table, originalText);
    this.moveToFocus(range, formatted.table, newFocus);
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

    // format table
    const formatted = completed.table.format(options);

    // apply to the editor
    this.updateText(range, formatted.table, originalText);
    const newPos = range.end.copy();
    if (completed.alignmentInserted) {
      newPos.row += 1;
    }
    newPos.row   += 1;
    newPos.column = 0;
    if (newPos.row > this.editor.getLastBufferRow()) {
      this.editor.setCursorBufferPosition(newPos);
      this.editor.insertNewline();
    }
    else {
      this.editor.setCursorBufferPosition(newPos);
    }

    // unset smart-cursor
    this.smartCursorActive = false;
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }

    const completedFocusCell = completed.table.getCell(newFocus.pos).copy();

    // set alignment
    completed.table.setAlignment(focus.pos.column, alignment, options);

    // format table
    const formatted = completed.table.format(options);

    // compute new focus offset
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
      const contentOffset = Math.min(
        completedFocusCell.computeContentOffset(focus.offset),
        formattedFocusCell.content.length
      );
      newFocus.offset = formattedFocusCell.computeRawOffset(contentOffset);
    }

    // apply to the editor
    this.updateText(range, formatted.table, originalText);
    this.moveToFocus(range, formatted.table, newFocus);
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }

    // format table
    const formatted = completed.table.format(options);

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
      const contentOffset = Math.min(
        completedFocusCell.computeContentOffset(focus.offset),
        formattedFocusCell.content.length
      );
      newFocus.offset = formattedFocusCell.computeRawOffset(contentOffset);
    }

    // apply to the editor
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

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
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // unset smart-cursor if focus is moved
    if (!focus.pos.isEqual(newFocus.pos)) {
      this.smartCursorActive = false;
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

    // unset smart-cursor if focus has been moved
    const focusMoved = !range.start.isEqual(this.smartCursorStartPos)
      || !focus.pos.isEqual(this.smartCursorFocusPos);
    if (this.smartCursorActive && focusMoved) {
      this.smartCursorActive = false;
    }

    // options
    const options     = this.getOptions();
    const smartCursor = atom.config.get(`${NAMESPACE}.smartCursor`);

    // complete table
    const completed = table.complete(options);

    // compute new focus position
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }

    // complete column if focus column is out
    if (newFocus.pos.row !== 1 && newFocus.pos.column >= completed.table.headerWidth) {
      for (let i = 0; i < completed.table.height; i++) {
        completed.table.rows[i].cells.push(
          i === 1
            ? TableCell.newAlignmentCell(Alignment.DEFAULT, options.minContentWidth)
            : new TableCell('')
        );
      }
    }

    // move to next cell
    if (newFocus.pos.row === 1) {
      newFocus.pos.row = 2;
      if (smartCursor) {
        if (this.smartCursorActive) {
          newFocus.pos.column = this.smartCursorColumn;
        }
        if (newFocus.pos.column < 0 || completed.table.headerWidth <= newFocus.pos.column) {
          newFocus.pos.column = 0;
        }
      }
      else {
        newFocus.pos.column = 0;
      }
    }
    else {
      newFocus.pos.column += 1;
    }

    // add empty row if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      completed.table.rows.push(new TableRow(
        new Array(completed.table.headerWidth).fill().map(() => new TableCell('')),
        '',
        ''
      ));
    }

    // format table
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // set smart-cursor active
    if (smartCursor) {
      if (!this.smartCursorActive) {
        this.smartCursorActive = true;
        this.smartCursorColumn = focus.pos.column;
        if (this.smartCursorColumn < 0 || completed.table.headerWidth <= this.smartCursorColumn) {
          this.smartCursorColumn = 0;
        }
        this.smartCursorStartPos = range.start.copy();
      }
      this.smartCursorFocusPos = newFocus.pos.copy();
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

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
    else if (newFocus.pos.row === 1) {
      newFocus.pos.row    = 0;
      newFocus.pos.column = completed.table.headerWidth - 1;
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
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // unset smart-cursor if focus is moved
    if (!focus.pos.isEqual(newFocus.pos)) {
      this.smartCursorActive = false;
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

    // unset smart-cursor if focus has been moved
    const focusMoved = !range.start.isEqual(this.smartCursorStartPos)
      || !focus.pos.isEqual(this.smartCursorFocusPos);
    if (this.smartCursorActive && focusMoved) {
      this.smartCursorActive = false;
    }

    // options
    const options     = this.getOptions();
    const smartCursor = atom.config.get(`${NAMESPACE}.smartCursor`);

    // complete table
    const completed = table.complete(options);

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
    // set column
    if (smartCursor) {
      if (this.smartCursorActive) {
        newFocus.pos.column = this.smartCursorColumn;
      }
      if (newFocus.pos.column < 0 || completed.table.headerWidth <= newFocus.pos.column) {
        newFocus.pos.column = 0;
      }
    }
    else {
      newFocus.pos.column = 0;
    }

    // add empty row if new focus row is out
    if (newFocus.pos.row >= completed.table.height) {
      completed.table.rows.push(new TableRow(
        new Array(completed.table.headerWidth).fill().map(() => new TableCell('')),
        '',
        ''
      ));
    }

    // format table
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // set smart-cursor active
    if (smartCursor) {
      if (!this.smartCursorActive) {
        this.smartCursorActive = true;
        this.smartCursorColumn = focus.pos.column;
        if (this.smartCursorColumn < 0 || completed.table.headerWidth <= this.smartCursorColumn) {
          this.smartCursorColumn = 0;
        }
        this.smartCursorStartPos = range.start.copy();
      }
      this.smartCursorFocusPos = newFocus.pos.copy();
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

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
      new Array(completed.table.headerWidth).fill().map(() => new TableCell('')),
      '',
      ''
    ));

    // format table
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table);
    this.moveToFocus(range, formatted.table, newFocus);

    // unset smart-cursor
    this.smartCursorActive = false;
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

    // compute new focus
    const newFocus = focus.copy();
    if (completed.alignmentInserted && newFocus.pos.row > 0) {
      newFocus.pos.row += 1;
    }
    if (newFocus.pos.row <= 1) {
      newFocus.pos.row = 2;
    }
    if (newFocus.pos.column < 0 || completed.table.headerWidth <= newFocus.pos.column) {
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
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // unset smart-cursor
    this.smartCursorActive = false;
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

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
          ? TableCell.newAlignmentCell(Alignment.DEFAULT, options.minContentWidth)
          : new TableCell('')
      );
    }

    // format table
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table);
    this.moveToFocus(range, formatted.table, newFocus);

    // unset smart-cursor
    this.smartCursorActive = false;
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
    const options = this.getOptions();

    // complete table
    const completed = table.complete(options);

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
            ? TableCell.newAlignmentCell(Alignment.DEFAULT, options.minContentWidth)
            : new TableCell('')
        );
      }
    }

    // move left if new focus row is out
    if (newFocus.pos.column >= completed.table.headerWidth) {
      newFocus.pos.column = completed.table.headerWidth - 1;
    }

    // format table
    const formatted = completed.table.format(options);

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
    this.updateText(range, formatted.table, originalText);
    this.selectFocus(range, formatted.table, newFocus);

    // unset smart-cursor
    this.smartCursorActive = false;
  }

  destroy() {
    this.subscriptions.dispose();
  }
}
