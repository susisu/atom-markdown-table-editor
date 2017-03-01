'use babel';

import { Point } from 'atom';

export class TableCell {
  constructor(raw) {
    this.raw = raw;
  }

  get content() {
    return this.raw.trim();
  }

  copy() {
    return new TableCell(this.raw);
  }

  toText() {
    return this.raw;
  }
}

export class TableRow {
  constructor(cells, marginLeft, marginRight) {
    this.cells       = cells;
    this.marginLeft  = marginLeft;
    this.marginRight = marginRight;
  }

  copy() {
    return new TableRow(
      this.cells.map(cell => cell.copy()),
      this.marginLeft,
      this.marginRight
    );
  }

  toText() {
    return this.marginLeft + '|'
      + this.cells.map(cell => cell.toText()).join('|')
      + '|' + this.marginRight;
  }
}

export class Table {
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

  toText() {
    return this.rows.map(row => row.toText()).join('\n');
  }

  computeFocus(pos) {
    const focusRow = pos.row - this.range.start.row;
    const row = this.rows[focusRow];
    if (!row) {
      return new Focus(new Point(0, 0), 0);
    }
    if (row.marginLeft.length + 1 > pos.column) {
      return new Focus(new Point(focusRow, -1), pos.column);
    }
    const ws = row.cells.map(cell => cell.raw.length);
    let c           = row.marginLeft.length + 1;
    let offset      = pos.column - (row.marginLeft.length + 1);
    let focusColumn = 0;
    for (; focusColumn < ws.length; focusColumn++) {
      c += ws[focusColumn] + 1;
      if (c > pos.column) {
        break;
      }
      offset -= ws[focusColumn] + 1;
    }
    return new Focus(new Point(focusRow, focusColumn), offset);
  }
}

export class Focus {
  constructor(pos, offset) {
    this.pos    = pos;
    this.offset = offset;
  }

  copy() {
    return new Focus(this.pos.copy(), this.offset);
  }
}
