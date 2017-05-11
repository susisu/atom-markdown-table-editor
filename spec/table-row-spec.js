'use babel';

/* eslint-env jasmine */

import { TableCell, TableRow } from '../lib/table.js';

describe('TableRow', () => {
  describe('constructor(cells, marginLeft, marginRight)', () => {
    it('should create a new TableRow instance', () => {
      const row = new TableRow(
        [new TableCell(' foo '), new TableCell(' bar ')],
        '',
        ' '
      );
      expect(row).toBeInstanceOf(TableRow);
      expect(row.cells).toHaveLength(2);
      expect(row.cells[0]).toBeInstanceOf(TableCell);
      expect(row.cells[0].raw).toBe(' foo ');
      expect(row.cells[1]).toBeInstanceOf(TableCell);
      expect(row.cells[1].raw).toBe(' bar ');
      expect(row.marginLeft).toBe('');
      expect(row.marginRight).toBe(' ');
    });
  });

  describe('static read(line)', () => {
    it('should read a table row from text', () => {
      {
        const line = ' foo ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(1);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo ');
        expect(row.marginLeft).toBe('');
        expect(row.marginRight).toBe('');
      }
      {
        const line = ' foo | bar ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(2);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo ');
        expect(row.cells[1]).toBeInstanceOf(TableCell);
        expect(row.cells[1].raw).toBe(' bar ');
        expect(row.marginLeft).toBe('');
        expect(row.marginRight).toBe('');
      }
      {
        const line = ' | foo | bar ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(2);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo ');
        expect(row.cells[1]).toBeInstanceOf(TableCell);
        expect(row.cells[1].raw).toBe(' bar ');
        expect(row.marginLeft).toBe(' ');
        expect(row.marginRight).toBe('');
      }
      {
        const line = ' | foo | bar | ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(2);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo ');
        expect(row.cells[1]).toBeInstanceOf(TableCell);
        expect(row.cells[1].raw).toBe(' bar ');
        expect(row.marginLeft).toBe(' ');
        expect(row.marginRight).toBe(' ');
      }
      {
        const line = ' | foo `|` bar | ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(1);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo `|` bar ');
        expect(row.marginLeft).toBe(' ');
        expect(row.marginRight).toBe(' ');
      }
      {
        const line = ' | foo \\| bar | ';
        const row = TableRow.read(line);
        expect(row).toBeInstanceOf(TableRow);
        expect(row.cells).toHaveLength(1);
        expect(row.cells[0]).toBeInstanceOf(TableCell);
        expect(row.cells[0].raw).toBe(' foo \\| bar ');
        expect(row.marginLeft).toBe(' ');
        expect(row.marginRight).toBe(' ');
      }
    });
  });

  describe('copy()', () => {
    it('should create a copy of the table row', () => {
      const row = new TableRow(
        [new TableCell(' foo '), new TableCell(' bar ')],
        '',
        ' '
      );
      const copy = row.copy();
      expect(copy).toBeInstanceOf(TableRow);
      expect(copy).not.toBe(row);
      expect(copy.cells).toHaveLength(2);
      expect(copy.cells).not.toBe(row.cells);
      expect(copy.cells[0]).toBeInstanceOf(TableCell);
      expect(copy.cells[0]).not.toBe(row.cells[0]);
      expect(copy.cells[0].raw).toBe(' foo ');
      expect(copy.cells[1]).toBeInstanceOf(TableCell);
      expect(copy.cells[1]).not.toBe(row.cells[1]);
      expect(copy.cells[1].raw).toBe(' bar ');
      expect(copy.marginLeft).toBe('');
      expect(copy.marginRight).toBe(' ');
    });
  });

  describe('toText()', () => {
    it('should return the text representation of the row', () => {
      {
        const row = new TableRow([], '', ' ');
        expect(row.toText()).toBe('|| ');
      }
      {
        const row = new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        );
        expect(row.toText()).toBe('| foo | bar | ');
      }
    });
  });

  describe('isAlignmentRow()', () => {
    it('should return wheter the row is an alignment row or not', () => {
      {
        const row = new TableRow(
          [new TableCell(' -------- '), new TableCell(':-------- ')],
          '',
          ' '
        );
        expect(row.isAlignmentRow()).toBe(true);
      }
      {
        const row = new TableRow(
          [new TableCell(' -------- '), new TableCell(' foo ')],
          '',
          ' '
        );
        expect(row.isAlignmentRow()).toBe(false);
      }
      {
        const row = new TableRow(
          [new TableCell(' foo '), new TableCell(' bar ')],
          '',
          ' '
        );
        expect(row.isAlignmentRow()).toBe(false);
      }
    });
  });
});
