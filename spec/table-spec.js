'use babel';

/* eslint-env jasmine */

import { Point, Range } from 'atom';

import { Alignment, TableCell, TableRow, Table, Focus } from '../lib/table.js';

describe('Table', () => {
  describe('constructor(rows)', () => {
    it('should create a new Table instance', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      expect(table).toBeInstanceOf(Table);
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0]).toBeInstanceOf(TableRow);
      expect(table.rows[0].cells).toHaveLength(2);
      expect(table.rows[0].cells[0]).toBeInstanceOf(TableCell);
      expect(table.rows[0].cells[0].raw).toBe(' foo ');
      expect(table.rows[0].cells[1]).toBeInstanceOf(TableCell);
      expect(table.rows[0].cells[1].raw).toBe(' bar ');
      expect(table.rows[0].marginLeft).toBe('');
      expect(table.rows[0].marginRight).toBe(' ');
      expect(table.rows[1]).toBeInstanceOf(TableRow);
      expect(table.rows[1].cells).toHaveLength(1);
      expect(table.rows[1].cells[0]).toBeInstanceOf(TableCell);
      expect(table.rows[1].cells[0].raw).toBe(' baz ');
      expect(table.rows[1].marginLeft).toBe('  ');
      expect(table.rows[1].marginRight).toBe('   ');
    });
  });

  describe('static read(lines)', () => {
    it('should read table from text', () => {
      const lines = [
        ' foo | bar | ',
        '  | baz |   '
      ];
      const table = Table.read(lines);
      expect(table).toBeInstanceOf(Table);
      expect(table.rows).toHaveLength(2);
      expect(table.rows[0]).toBeInstanceOf(TableRow);
      expect(table.rows[0].cells).toHaveLength(2);
      expect(table.rows[0].cells[0]).toBeInstanceOf(TableCell);
      expect(table.rows[0].cells[0].raw).toBe(' foo ');
      expect(table.rows[0].cells[1]).toBeInstanceOf(TableCell);
      expect(table.rows[0].cells[1].raw).toBe(' bar ');
      expect(table.rows[0].marginLeft).toBe('');
      expect(table.rows[0].marginRight).toBe(' ');
      expect(table.rows[1]).toBeInstanceOf(TableRow);
      expect(table.rows[1].cells).toHaveLength(1);
      expect(table.rows[1].cells[0]).toBeInstanceOf(TableCell);
      expect(table.rows[1].cells[0].raw).toBe(' baz ');
      expect(table.rows[1].marginLeft).toBe('  ');
      expect(table.rows[1].marginRight).toBe('   ');
    });
  });

  describe('copy()', () => {
    it('should create a copy of the table object', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      const copy = table.copy();
      expect(copy).toBeInstanceOf(Table);
      expect(copy).not.toBe(table);
      expect(copy.rows).toHaveLength(2);
      expect(copy.rows).not.toBe(table.rows);
      expect(copy.rows[0]).toBeInstanceOf(TableRow);
      expect(copy.rows[0]).not.toBe(table.rows[0]);
      expect(copy.rows[0].cells).toHaveLength(2);
      expect(copy.rows[0].cells[0]).toBeInstanceOf(TableCell);
      expect(copy.rows[0].cells[0]).not.toBe(table.rows[0].cells[0]);
      expect(copy.rows[0].cells[0].raw).toBe(' foo ');
      expect(copy.rows[0].cells[1]).toBeInstanceOf(TableCell);
      expect(copy.rows[0].cells[1]).not.toBe(table.rows[0].cells[1]);
      expect(copy.rows[0].cells[1].raw).toBe(' bar ');
      expect(copy.rows[0].marginLeft).toBe('');
      expect(copy.rows[0].marginRight).toBe(' ');
      expect(copy.rows[1]).toBeInstanceOf(TableRow);
      expect(copy.rows[1]).not.toBe(table.rows[1]);
      expect(copy.rows[1].cells).toHaveLength(1);
      expect(copy.rows[1].cells[0]).toBeInstanceOf(TableCell);
      expect(copy.rows[1].cells[0]).not.toBe(table.rows[1].cells[0]);
      expect(copy.rows[1].cells[0].raw).toBe(' baz ');
      expect(copy.rows[1].marginLeft).toBe('  ');
      expect(copy.rows[1].marginRight).toBe('   ');
    });
  });

  describe('toText()', () => {
    it('should return the text representation of the table', () => {
      {
        const table = new Table([]);
        expect(table.toText()).toBe('');
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.toText()).toBe('| foo | bar | \n  | baz |   ');
      }
    });
  });

  describe('get height', () => {
    it('should return the number of the rows in the table', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      expect(table.height).toBe(2);
    });
  });

  describe('get width', () => {
    it('should return the maximum number of the columns in the table', () => {
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.width).toBe(2);
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' bar '), new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.width).toBe(2);
      }
    });
  });

  describe('get headerWidth', () => {
    it('should return the number of the columns of the header row', () => {
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.headerWidth).toBe(2);
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' bar '), new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.headerWidth).toBe(1);
      }
    });
  });

  describe('get alignmentRow', () => {
    it('should return the alignment row in the table', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' ---- '), new TableCell(':----:')],
          '',
          ''
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      const alignmentRow = table.alignmentRow;
      expect(alignmentRow).toBeInstanceOf(TableRow);
      expect(alignmentRow.cells).toHaveLength(2);
      expect(alignmentRow.cells[0]).toBeInstanceOf(TableCell);
      expect(alignmentRow.cells[0].raw).toBe(' ---- ');
      expect(alignmentRow.cells[1]).toBeInstanceOf(TableCell);
      expect(alignmentRow.cells[1].raw).toBe(':----:');
      expect(alignmentRow.marginLeft).toBe('');
      expect(alignmentRow.marginRight).toBe('');
    });

    it('should return undefined if there is no alignment row', () => {
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.alignmentRow).toBe(undefined);
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' ---- '), new TableCell(':----:')],
            '',
            ''
          ),
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        expect(table.alignmentRow).toBe(undefined);
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          ),
          new TableRow(
            [new TableCell(' ---- '), new TableCell(':----:')],
            '',
            ''
          )
        ]);
        expect(table.alignmentRow).toBe(undefined);
      }
    });
  });

  describe('getCell(pos)', () => {
    it('should return a cell object at the position', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      const cell1 = table.getCell(new Point(0, 0));
      expect(cell1).toBeInstanceOf(TableCell);
      expect(cell1.raw).toBe(' foo ');
      const cell2 = table.getCell(new Point(0, 1));
      expect(cell2).toBeInstanceOf(TableCell);
      expect(cell2.raw).toBe(' bar ');
      const cell3 = table.getCell(new Point(1, 0));
      expect(cell3).toBeInstanceOf(TableCell);
      expect(cell3.raw).toBe(' baz ');
    });

    it('should return undefined if there is no table cell at the position', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      expect(table.getCell(new Point(-1, 0))).toBe(undefined);
      expect(table.getCell(new Point(0, -1))).toBe(undefined);
      expect(table.getCell(new Point(0, 2))).toBe(undefined);
      expect(table.getCell(new Point(1, 1))).toBe(undefined);
    });
  });

  describe('computeFocus(startRow, pos)', () => {
    it('should compute focus from a position', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      // out of range
      {
        const focus = table.computeFocus(10, new Point(9, 0));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(0);
      }
      // row 0 left margin
      {
        const focus = table.computeFocus(10, new Point(10, 0));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(-1);
        expect(focus.offset).toBe(0);
      }
      // cell 0 0
      {
        const focus = table.computeFocus(10, new Point(10, 1));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(10, 6));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(5);
      }
      // cell 0 1
      {
        const focus = table.computeFocus(10, new Point(10, 7));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(1);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(10, 12));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(1);
        expect(focus.offset).toBe(5);
      }
      // row 0 right margin
      {
        const focus = table.computeFocus(10, new Point(10, 13));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(2);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(10, 14));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(2);
        expect(focus.offset).toBe(1);
      }
      // row 1 left margin
      {
        const focus = table.computeFocus(10, new Point(11, 0));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(-1);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(11, 2));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(-1);
        expect(focus.offset).toBe(2);
      }
      // cell 1 0
      {
        const focus = table.computeFocus(10, new Point(11, 3));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(11, 8));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(5);
      }
      // row 1 right margin
      {
        const focus = table.computeFocus(10, new Point(11, 9));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(1);
        expect(focus.offset).toBe(0);
      }
      {
        const focus = table.computeFocus(10, new Point(11, 12));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(1);
        expect(focus.pos.column).toBe(1);
        expect(focus.offset).toBe(3);
      }
      // out of range
      {
        const focus = table.computeFocus(10, new Point(12, 0));
        expect(focus).toBeInstanceOf(Focus);
        expect(focus.pos.row).toBe(0);
        expect(focus.pos.column).toBe(0);
        expect(focus.offset).toBe(0);
      }
    });
  });

  describe('computePosition(startRow, focus)', () => {
    it('should computer position from a focus', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      // row 0 left margin
      {
        const pos = table.computePosition(10, new Focus(new Point(0, -1), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(0);
      }
      // cell 0 0
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 0), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(1);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 0), 5));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(6);
      }
      // cell 0 1
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 1), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(7);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 1), 5));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(12);
      }
      // row 0 right margin
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 2), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(13);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(0, 2), 1));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(10);
        expect(pos.column).toBe(14);
      }
      // row 1 left margin
      {
        const pos = table.computePosition(10, new Focus(new Point(1, -1), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(0);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(1, -1), 2));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(2);
      }
      // cell 1 0
      {
        const pos = table.computePosition(10, new Focus(new Point(1, 0), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(3);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(1, 0), 5));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(8);
      }
      // row 1 right margin
      {
        const pos = table.computePosition(10, new Focus(new Point(1, 2), 0));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(9);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(1, 2), 3));
        expect(pos).toBeInstanceOf(Point);
        expect(pos.row).toBe(11);
        expect(pos.column).toBe(12);
      }
    });

    it('should return undefined if focus is out of range', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      {
        const pos = table.computePosition(10, new Focus(new Point(-1, 0), 0));
        expect(pos).toBe(undefined);
      }
      {
        const pos = table.computePosition(10, new Focus(new Point(2, 0), 0));
        expect(pos).toBe(undefined);
      }
    });
  });

  describe('computeSelectionRange(startRow, focus)', () => {
    it('should compute selection range from a focus', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      // cell 0 0
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 0), 0));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(10);
        expect(sel.start.column).toBe(2);
        expect(sel.end.row).toBe(10);
        expect(sel.end.column).toBe(5);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 0), 5));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(10);
        expect(sel.start.column).toBe(2);
        expect(sel.end.row).toBe(10);
        expect(sel.end.column).toBe(5);
      }
      // cell 0 1
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 1), 0));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(10);
        expect(sel.start.column).toBe(8);
        expect(sel.end.row).toBe(10);
        expect(sel.end.column).toBe(11);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 1), 5));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(10);
        expect(sel.start.column).toBe(8);
        expect(sel.end.row).toBe(10);
        expect(sel.end.column).toBe(11);
      }
      // cell 1 0
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, 0), 0));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(11);
        expect(sel.start.column).toBe(4);
        expect(sel.end.row).toBe(11);
        expect(sel.end.column).toBe(7);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, 0), 5));
        expect(sel).toBeInstanceOf(Range);
        expect(sel.start.row).toBe(11);
        expect(sel.start.column).toBe(4);
        expect(sel.end.row).toBe(11);
        expect(sel.end.column).toBe(7);
      }
    });

    it('should return undefined if the focus is in margin or out of range', () => {
      const table = new Table([
        new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        ),
        new TableRow(
          [new TableCell(' baz ')],
          '  ',
          '   '
        )
      ]);
      // row 0 left margin
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, -1), 0));
        expect(sel).toBe(undefined);
      }
      // row 0 right margin
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 2), 0));
        expect(sel).toBe(undefined);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(0, 2), 1));
        expect(sel).toBe(undefined);
      }
      // row 1 left margin
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, -1), 0));
        expect(sel).toBe(undefined);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, -1), 2));
        expect(sel).toBe(undefined);
      }
      // row 1 right margin
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, 2), 0));
        expect(sel).toBe(undefined);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(1, 2), 3));
        expect(sel).toBe(undefined);
      }
      // out of range
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(-1, 0), 0));
        expect(sel).toBe(undefined);
      }
      {
        const sel = table.computeSelectionRange(10, new Focus(new Point(2, 0), 0));
        expect(sel).toBe(undefined);
      }
    });
  });

  describe('complete(options)', () => {
    it('should return an object containing a completed copy of the table and a boolean specifying whether an alignment is inserted', () => {
      // no rows
      {
        const table = new Table([]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '||\n'
          + '| ----- |'
        );
        expect(completed.alignmentInserted).toBe(true);
      }
      // no columns
      {
        const table = new Table([
          new TableRow([], '', ' '),
          new TableRow([], '  ', '   ')
        ]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| |\n'
          + '| ----- |\n'
          + '  |   |'
        );
        expect(completed.alignmentInserted).toBe(true);
      }
      // no alignment row
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| foo | bar | \n'
          + '| ----- | ----- |\n'
          + '  | baz |   |'
        );
        expect(completed.alignmentInserted).toBe(true);
      }
      // some cells lacked
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' ---- '), new TableCell(':----:')],
            '',
            ''
          ),
          new TableRow(
            [new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| foo | bar | \n'
          + '| ---- |:----:|\n'
          + '  | baz |   |'
        );
        expect(completed.alignmentInserted).toBe(false);
      }
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' ---- '), new TableCell(':----:')],
            '',
            ''
          ),
          new TableRow(
            [new TableCell(' bar '), new TableCell(' baz ')],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| foo | |\n'
          + '| ---- |:----:|\n'
          + '  | bar | baz |   '
        );
        expect(completed.alignmentInserted).toBe(false);
      }
      // no cells lacked
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' ---- '), new TableCell(':----:')],
            '',
            ''
          ),
          new TableRow(
            [new TableCell(' baz '), new TableCell(' nya ')],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth: 5
        };
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| foo | bar | \n'
          + '| ---- |:----:|\n'
          + '  | baz | nya |   '
        );
        expect(completed.alignmentInserted).toBe(false);
      }
      // use 3 as default value for minContentWidth
      {
        const table = new Table([
          new TableRow(
            [new TableCell(' foo '), new TableCell(' bar ')],
            '',
            ' '
          ),
          new TableRow(
            [new TableCell(' baz '), new TableCell(' nya ')],
            '  ',
            '   '
          )
        ]);
        const options = {};
        const completed = table.complete(options);
        expect(completed.table).toBeInstanceOf(Table);
        expect(completed.table.toText()).toBe(
            '| foo | bar | \n'
          + '| --- | --- |\n'
          + '  | baz | nya |   '
        );
        expect(completed.alignmentInserted).toBe(true);
      }
    });
  });

  describe('format(options)', () => {
    it('should return an object containing a formatted copy of the table and the left margin of all the rows', () => {
      // no rows
      {
        const table = new Table([]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe('');
        expect(formatted.marginLeft).toBe(0);
      }
      // no columns
      {
        const table = new Table([
          new TableRow([], '', ' '),
          new TableRow([], '  ', '   ')
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '||\n'
          + '||'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // no alignment row
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| foo   | bar   | あ    | Ω    |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // with alignment row
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // add left margin
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '    ',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '    |  foo  |  bar  |  あ   |  Ω   |\n'
          + '    | ----- |:----- | -----:|:-----:|\n'
          + '    | foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('    ');
      }
      // use 3 as default value for minContentWidth
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '| foo | bar | あ  | Ω  |\n'
          + '| --- |:--- | ---:|:---:|\n'
          + '| foo | bar |  あ | Ω  |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // use true as default value for ambiguousAsWide
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // turn off ambiguousAsWide
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : false,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |   Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |   Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // set Ω to be wide
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : false,
          alwaysWideChars  : new Set('Ω'),
          alwaysNarrowChars: new Set()
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // set Ω to be narrow
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set(),
          alwaysNarrowChars: new Set('Ω')
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |   Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |   Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // use empty set as default value for alwaysWideChars and alwaysNarrowChars
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth: 5,
          ambiguousAsWide: true
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
      // alwaysWideChars is stronger than alwaysNarrowChars
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const options = {
          minContentWidth  : 5,
          ambiguousAsWide  : true,
          alwaysWideChars  : new Set('Ω'),
          alwaysNarrowChars: new Set('Ω')
        };
        const formatted = table.format(options);
        expect(formatted.table).toBeInstanceOf(Table);
        expect(formatted.table.toText()).toBe(
            '|  foo  |  bar  |  あ   |  Ω   |\n'
          + '| ----- |:----- | -----:|:-----:|\n'
          + '| foo   | bar   |    あ |  Ω   |'
        );
        expect(formatted.marginLeft).toBe('');
      }
    });
  });

  describe('setAlignment(column, alignment, options)', () => {
    it('should update alignment of a column', () => {
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const copy = table.copy();
        const options = {
          minContentWidth: 5
        };
        table.setAlignment(1, Alignment.RIGHT, options);
        table.rows.forEach((row, i) => {
          row.cells.forEach((cell, j) => {
            if (i === 1 && j === 1) {
              expect(cell.raw).toBe(' -----:');
            }
            else {
              expect(cell.raw).toBe(copy.rows[i].cells[j].raw);
            }
          });
        });
      }
      // use 3 as default value for minContentWidth
      {
        const table = new Table([
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '',
            ' '
          ),
          new TableRow(
            [
              new TableCell(' ---- '), new TableCell(':---- '),
              new TableCell(' ----:'), new TableCell(':----:')
            ],
            '',
            ''
          ),
          new TableRow(
            [
              new TableCell(' foo '), new TableCell(' bar '),
              new TableCell(' あ '), new TableCell(' Ω ')
            ],
            '  ',
            '   '
          )
        ]);
        const copy = table.copy();
        const options = {};
        table.setAlignment(1, Alignment.RIGHT, options);
        table.rows.forEach((row, i) => {
          row.cells.forEach((cell, j) => {
            if (i === 1 && j === 1) {
              expect(cell.raw).toBe(' ---:');
            }
            else {
              expect(cell.raw).toBe(copy.rows[i].cells[j].raw);
            }
          });
          expect(row.marginLeft).toBe(copy.rows[i].marginLeft);
          expect(row.marginRight).toBe(copy.rows[i].marginRight);
        });
      }
    });

    it('should do nothing if there is no alignment row', () => {
      const table = new Table([
        new TableRow(
          [
            new TableCell(' foo '), new TableCell(' bar '),
            new TableCell(' あ '), new TableCell(' Ω ')
          ],
          '',
          ' '
        ),
        new TableRow(
          [
            new TableCell(' foo '), new TableCell(' bar '),
            new TableCell(' あ '), new TableCell(' Ω ')
          ],
          '  ',
          '   '
        )
      ]);
      const copy = table.copy();
      const options = {
        minContentWidth: 5
      };
      table.setAlignment(1, Alignment.RIGHT, options);
      table.rows.forEach((row, i) => {
        row.cells.forEach((cell, j) => {
          expect(cell.raw).toBe(copy.rows[i].cells[j].raw);
        });
        expect(row.marginLeft).toBe(copy.rows[i].marginLeft);
        expect(row.marginRight).toBe(copy.rows[i].marginRight);
      });
    });
  });
});
