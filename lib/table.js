'use babel';

import { Point, Range } from 'atom';

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
  constructor(rows) {
    this.rows  = rows;
  }

  copy() {
    return new Table(this.rows.map(row => row.copy()));
  }

  toText() {
    return this.rows.map(row => row.toText()).join('\n');
  }

  computeFocus(start, pos) {
    const focusRow = pos.row - start.row;
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

  computePosition(start, focus) {
    const row = this.rows[focus.pos.row];
    if (!row) {
      return undefined;
    }
    const r = start.row + focus.pos.row;
    if (focus.pos.column < 0) {
      return new Point(r, focus.offset);
    }
    else if (focus.pos.column >= row.cells.length) {
      const c = row.marginLeft.length + 1
        + row.cells.reduce((sum, cell) => sum + cell.raw.length + 1, 0);
      return new Point(r, c + focus.offset);
    }
    else {
      let c = row.marginLeft.length + 1;
      for (let i = 0; i < focus.pos.column; i++) {
        c += row.cells[i].raw.length + 1;
      }
      return new Point(r, c + focus.offset);
    }
  }

  computeSelectionRange(start, focus) {
    const row = this.rows[focus.pos.row];
    if (!row) {
      return undefined;
    }
    const cell = row.cells[focus.pos.column];
    if (!cell) {
      return undefined;
    }
    const r = start.row + focus.pos.row;
    let c = row.marginLeft.length + 1;
    for (let i = 0; i < focus.pos.column; i++) {
      c += row.cells[i].raw.length + 1;
    }
    c += cell.raw.length - cell.raw.trimLeft().length;
    return new Range(
      new Point(r, c),
      new Point(r, c + cell.content.length)
    );
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
