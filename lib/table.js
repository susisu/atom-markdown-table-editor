'use babel';

import { Point, Range } from 'atom';
import { getEAW } from 'meaw';

export const Alignment = Object.freeze({
  DEFAULT: 'default',
  LEFT   : 'left',
  RIGHT  : 'right',
  CENTER : 'center'
});

export class TableCell {
  constructor(raw) {
    this.raw = raw;
  }

  static newAlignmentCell(alignment, contentWidth) {
    return new TableCell(alignmentText(alignment, contentWidth));
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

  isAlignmentCell() {
    return /^\s*\:?\-+\:?\s*$/.test(this.raw);
  }

  get alignment() {
    const content = this.content;
    if (content[0] === ':') {
      if (content[content.length - 1] === ':') {
        return Alignment.CENTER;
      }
      else {
        return Alignment.LEFT;
      }
    }
    else {
      if (content[content.length - 1] === ':') {
        return Alignment.RIGHT;
      }
      else {
        return Alignment.DEFAULT;
      }
    }
  }

  computeContentOffset(rawOffset) {
    const padLeft = this.raw.length - this.raw.trimLeft().length;
    if (rawOffset < padLeft) {
      return 0;
    }
    else if (rawOffset < padLeft + this.content.length) {
      return rawOffset - padLeft;
    }
    else {
      return this.content.length;
    }
  }

  computeRawOffset(contentOffset) {
    if (this.content === '') {
      return this.raw.length > 0 ? 1 : 0;
    }
    else {
      const padLeft = this.raw.length - this.raw.trimLeft().length;
      return contentOffset + padLeft;
    }
  }
}

export class TableRow {
  constructor(cells, marginLeft, marginRight) {
    this.cells       = cells;
    this.marginLeft  = marginLeft;
    this.marginRight = marginRight;
  }

  static read(line) {
    let rawCells = splitCells(line);
    let marginLeft;
    if (rawCells.length > 0 && rawCells[0].trim() === '') {
      marginLeft = rawCells[0];
      rawCells   = rawCells.slice(1);
    }
    else {
      marginLeft = '';
    }
    let marginRight;
    if (rawCells.length > 0 && rawCells[rawCells.length - 1].trim() === '') {
      marginRight = rawCells[rawCells.length - 1];
      rawCells    = rawCells.slice(0, rawCells.length - 1);
    }
    else {
      marginRight = '';
    }
    const cells = rawCells.map(cell => new TableCell(cell));
    return new TableRow(cells, marginLeft, marginRight);
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

  isAlignmentRow() {
    return this.cells.every(cell => cell.isAlignmentCell());
  }
}

export class Table {
  constructor(rows) {
    this.rows = rows;
  }

  static read(lines) {
    const rows = lines.map(line => TableRow.read(line));
    return new Table(rows);
  }

  copy() {
    return new Table(this.rows.map(row => row.copy()));
  }

  toText() {
    return this.rows.map(row => row.toText()).join('\n');
  }

  get height() {
    return this.rows.length;
  }

  get width() {
    return this.rows.map(row => row.cells.length)
      .reduce((x, y) => Math.max(x, y), 0);
  }

  get headerWidth() {
    return this.rows[0]
      ? this.rows[0].cells.length
      : 0;
  }

  get alignmentRow() {
    return this.rows[1] && this.rows[1].isAlignmentRow()
      ? this.rows[1]
      : undefined;
  }

  getCell(pos) {
    const row = this.rows[pos.row];
    if (!row) {
      return undefined;
    }
    const cell = row.cells[pos.column];
    if (!cell) {
      return undefined;
    }
    return cell;
  }

  computeFocus(startRow, pos) {
    const focusRow = pos.row - startRow;
    const row = this.rows[focusRow];
    if (!row) {
      return new Focus(new Point(0, 0), 0);
    }
    if (pos.column < row.marginLeft.length + 1) {
      return new Focus(new Point(focusRow, -1), pos.column);
    }
    else {
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

  computePosition(startRow, focus) {
    const row = this.rows[focus.pos.row];
    if (!row) {
      return undefined;
    }
    const r = startRow + focus.pos.row;
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

  computeSelectionRange(startRow, focus) {
    const row = this.rows[focus.pos.row];
    if (!row) {
      return undefined;
    }
    const cell = row.cells[focus.pos.column];
    if (!cell) {
      return undefined;
    }
    if (cell.content === '') {
      return undefined;
    }
    const r = startRow + focus.pos.row;
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

  complete(options) {
    const height = this.height;
    const width  = this.width;

    if (height === 0) {
      return new Table(
        [new TableRow([new TableCell('')], '', '')]
      ).complete(options);
    }
    if (width === 0) {
      return new Table(
        this.rows.map(row =>
          new TableRow([new TableCell(row.marginRight)], row.marginLeft, '')
        )
      ).complete(options);
    }

    const minContentWidth = options.minContentWidth || 3;

    const rows = [];
    // head
    rows.push(new TableRow(
      extendArray(this.rows[0].cells, width, j =>
        new TableCell(
          j === this.rows[0].cells.length
            ? this.rows[0].marginRight
            : ''
        )
      ),
      this.rows[0].marginLeft,
      this.rows[0].cells.length < width ? '' : this.rows[0].marginRight
    ));

    // alignment
    const alignmentRow = this.alignmentRow;
    if (alignmentRow) {
      rows.push(new TableRow(
        extendArray(alignmentRow.cells, width, j =>
          new TableCell(alignmentText(
            Alignment.DEFAULT,
            j === alignmentRow.cells.length
              ? Math.max(minContentWidth, alignmentRow.marginRight.length - 2)
              : minContentWidth
          ))
        ),
        alignmentRow.marginLeft,
        alignmentRow.cells.length < width ? '' : alignmentRow.marginRight
      ));
    }
    else {
      rows.push(new TableRow(
        extendArray([], width, () =>
          new TableCell(alignmentText(Alignment.DEFAULT, minContentWidth))
        ),
        this.rows[0].marginLeft,
        ''
      ));
    }
    // body
    for (let i = alignmentRow ? 2 : 1; i < height; i++) {
      rows.push(new TableRow(
        extendArray(this.rows[i].cells, width, j =>
          new TableCell(
            j === this.rows[i].cells.length
              ? this.rows[i].marginRight
              : ''
          )
        ),
        this.rows[i].marginLeft,
        this.rows[i].cells.length < width ? '' : this.rows[i].marginRight
      ));
    }

    return {
      table            : new Table(rows),
      alignmentInserted: !alignmentRow
    };
  }

  format(options) {
    const width  = this.width;
    const height = this.height;

    if (height === 0) {
      return {
        table     : new Table([]),
        marginLeft: 0
      };
    }
    if (width === 0) {
      const marginLeft = this.rows[0].marginLeft;
      return {
        table: new Table(this.rows.map(() => new TableRow([], marginLeft, ''))),
        marginLeft
      };
    }

    const minContentWidth = options.minContentWidth || 3;
    const ambiguousAsWide = options.ambiguousAsWide === undefined
      ? true
      : options.ambiguousAsWide;
    const alwaysWideChars   = options.alwaysWideChars || new Set();
    const alwaysNarrowChars = options.alwaysNarrowChars || new Set();

    const eawOptions = {
      ambiguousAsWide,
      alwaysWideChars,
      alwaysNarrowChars
    };

    const alignmentRow  = this.alignmentRow;
    const marginLeft    = this.rows[0].marginLeft;
    const contentWidths = new Array(width).fill(minContentWidth);
    for (let i = 0; i < height; i++) {
      if (alignmentRow && i === 1) {
        continue;
      }
      for (let j = 0; j < this.rows[i].cells.length; j++) {
        contentWidths[j] = Math.max(
          contentWidths[j],
          length(this.rows[i].cells[j].content, eawOptions)
        );
      }
    }
    const alignments = alignmentRow
      ? extendArray(
          alignmentRow.cells.map(cell => cell.alignment),
          width,
          () => Alignment.DEFAULT
        )
      : new Array(width).fill(Alignment.DEFAULT);

    const rows = [];
    // header
    rows.push(new TableRow(
      this.rows[0].cells.map((cell, j) =>
        new TableCell(pad(align(cell.content, Alignment.CENTER, contentWidths[j], eawOptions)))
      ),
      marginLeft,
      ''
    ));
    // alignment
    if (alignmentRow) {
      rows.push(new TableRow(
        alignmentRow.cells.map((cell, j) =>
          new TableCell(alignmentText(alignments[j], contentWidths[j]))
        ),
        marginLeft,
        ''
      ));
    }
    // body
    for (let i = alignmentRow ? 2 : 1; i < height; i++) {
      rows.push(new TableRow(
        this.rows[i].cells.map((cell, j) =>
          new TableCell(pad(align(cell.content, alignments[j], contentWidths[j], eawOptions)))
        ),
        marginLeft,
        ''
      ));
    }

    return {
      table: new Table(rows),
      marginLeft
    };
  }

  setAlignment(column, alignment, options) {
    const alignmentRow = this.alignmentRow;
    if (!alignmentRow) {
      return;
    }
    const cell = alignmentRow.cells[column];
    if (!cell) {
      return;
    }
    const minContentWidth = options.minContentWidth || 3;
    cell.raw = alignmentText(alignment, minContentWidth);
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

function extendArray(arr, size, callback) {
  const extended = arr.slice();
  const len = arr.length;
  for (let i = len; i < size; i++) {
    extended.push(callback.call(undefined, i, arr));
  }
  return extended;
}

function alignmentText(alignment, contentWidth) {
  switch (alignment) {
  case Alignment.LEFT:
    return `:${'-'.repeat(contentWidth)} `;
  case Alignment.RIGHT:
    return ` ${'-'.repeat(contentWidth)}:`;
  case Alignment.CENTER:
    return `:${'-'.repeat(contentWidth)}:`;
  case Alignment.DEFAULT:
  default:
    return ` ${'-'.repeat(contentWidth)} `;
  }
}

function length(str, eawOptions) {
  let len = 0;
  for (const char of str) {
    if (eawOptions.alwaysWideChars.has(char)) {
      len += 2;
      continue;
    }
    if (eawOptions.alwaysNarrowChars.has(char)) {
      len += 1;
      continue;
    }
    switch (getEAW(char)) {
    case 'F':
    case 'W':
      len += 2;
      break;
    case 'A':
      len += eawOptions.ambiguousAsWide ? 2 : 1;
      break;
    default:
      len += 1;
    }
  }
  return len;
}

function align(content, alignment, contentWidth, eawOptions) {
  const space = contentWidth - length(content, eawOptions);
  if (space < 0) {
    return content;
  }
  switch (alignment) {
  case Alignment.RIGHT:
    return ' '.repeat(space) + content;
  case Alignment.CENTER:
    return ' '.repeat(Math.floor(space / 2))
      + content
      + ' '.repeat(Math.ceil(space / 2));
  case Alignment.LEFT:
  case Alignment.DEFAULT:
  default:
    return content + ' '.repeat(space);
  }
}

function pad(str) {
  return ` ${str} `;
}
