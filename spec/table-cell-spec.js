'use babel';

/* eslint-env jasmine */

import { Alignment, TableCell } from '../lib/table.js';

describe('TableCell', () => {
  describe('constructor(raw)', () => {
    it('should create a new TableCell instance', () => {
      const cell = new TableCell(' raw content ');
      expect(cell).toBeInstanceOf(TableCell);
      expect(cell.raw).toBe(' raw content ');
    });
  });

  describe('static newAlignmentCell(alignment, contentWidth)', () => {
    it('should create a new TabeCell instance with content specifying alignment', () => {
      // default
      {
        const cell = TableCell.newAlignmentCell(Alignment.DEFAULT, 4);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(' ---- ');
      }
      {
        const cell = TableCell.newAlignmentCell(Alignment.DEFAULT, 8);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(' -------- ');
      }
      // left
      {
        const cell = TableCell.newAlignmentCell(Alignment.LEFT, 4);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(':---- ');
      }
      {
        const cell = TableCell.newAlignmentCell(Alignment.LEFT, 8);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(':-------- ');
      }
      // right
      {
        const cell = TableCell.newAlignmentCell(Alignment.RIGHT, 4);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(' ----:');
      }
      {
        const cell = TableCell.newAlignmentCell(Alignment.RIGHT, 8);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(' --------:');
      }
      // center
      {
        const cell = TableCell.newAlignmentCell(Alignment.CENTER, 4);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(':----:');
      }
      {
        const cell = TableCell.newAlignmentCell(Alignment.CENTER, 8);
        expect(cell).toBeInstanceOf(TableCell);
        expect(cell.raw).toBe(':--------:');
      }
    });
  });

  describe('get content', () => {
    it('should get the trimmed content of the cell', () => {
      const cell = new TableCell(' raw content ');
      expect(cell.content).toBe('raw content');
    });
  });

  describe('copy()', () => {
    it('should create a copy of the cell', () => {
      const cell = new TableCell(' raw content ');
      const copy = cell.copy();
      expect(copy).toBeInstanceOf(TableCell);
      expect(copy).not.toBe(cell);
      expect(copy.raw).toBe(' raw content ');
    });
  });

  describe('toText()', () => {
    it('should return the text representation of the cell', () => {
      const cell = new TableCell(' raw content ');
      expect(cell.toText()).toBe(' raw content ');
    });
  });

  describe('isAlignmentCell()', () => {
    it('should return whether the cell is an alignment cell or not', () => {
      {
        const cell = new TableCell(' -------- ');
        expect(cell.isAlignmentCell()).toBe(true);
      }
      {
        const cell = new TableCell(':-------- ');
        expect(cell.isAlignmentCell()).toBe(true);
      }
      {
        const cell = new TableCell(' --------:');
        expect(cell.isAlignmentCell()).toBe(true);
      }
      {
        const cell = new TableCell(':--------:');
        expect(cell.isAlignmentCell()).toBe(true);
      }
      {
        const cell = new TableCell(' raw content ');
        expect(cell.isAlignmentCell()).toBe(false);
      }
    });
  });

  describe('get alignment', () => {
    it('should get the alignment of the alignment cell', () => {
      {
        const cell = new TableCell(' -------- ');
        expect(cell.alignment).toBe(Alignment.DEFAULT);
      }
      {
        const cell = new TableCell(':-------- ');
        expect(cell.alignment).toBe(Alignment.LEFT);
      }
      {
        const cell = new TableCell(' --------:');
        expect(cell.alignment).toBe(Alignment.RIGHT);
      }
      {
        const cell = new TableCell(':--------:');
        expect(cell.alignment).toBe(Alignment.CENTER);
      }
    });

    it('should return the default alignment if the cell is not an alignment cell', () => {
      const cell = new TableCell(' raw content ');
      expect(cell.alignment).toBe(Alignment.DEFAULT);
    });
  });

  describe('computeContentOffset(rawOffset)', () => {
    it('should return 0 if the content contains only whitespaces', () => {
      const cell = new TableCell('  ');
      expect(cell.computeContentOffset(0)).toBe(0);
      expect(cell.computeContentOffset(1)).toBe(0);
      expect(cell.computeContentOffset(2)).toBe(0);
    });

    it('should compute the content offset from the raw offset', () => {
      {
        const cell = new TableCell(' raw content ');
        expect(cell.computeContentOffset(0)).toBe(0);
        expect(cell.computeContentOffset(1)).toBe(0);
        expect(cell.computeContentOffset(5)).toBe(4);
        expect(cell.computeContentOffset(12)).toBe(11);
        expect(cell.computeContentOffset(13)).toBe(11);
      }
      {
        const cell = new TableCell('  raw content  ');
        expect(cell.computeContentOffset(0)).toBe(0);
        expect(cell.computeContentOffset(1)).toBe(0);
        expect(cell.computeContentOffset(2)).toBe(0);
        expect(cell.computeContentOffset(5)).toBe(3);
        expect(cell.computeContentOffset(13)).toBe(11);
        expect(cell.computeContentOffset(14)).toBe(11);
        expect(cell.computeContentOffset(15)).toBe(11);
      }
    });
  });

  describe('computeRawOffset(contentOffset)', () => {
    it('should return 0 if the raw content is empty', () => {
      const cell = new TableCell('');
      expect(cell.computeRawOffset(0)).toBe(0);
    });

    it('should return 1 if the content contains only whitespaces', () => {
      const cell = new TableCell('  ');
      expect(cell.computeRawOffset(0)).toBe(1);
    });

    it('should compute the raw offset from the content offset', () => {
      {
        const cell = new TableCell(' raw content ');
        expect(cell.computeRawOffset(0)).toBe(1);
        expect(cell.computeRawOffset(5)).toBe(6);
      }
      {
        const cell = new TableCell('  raw content  ');
        expect(cell.computeRawOffset(0)).toBe(2);
        expect(cell.computeRawOffset(5)).toBe(7);
      }
    });
  });
});
