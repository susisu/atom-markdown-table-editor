'use babel';

/* eslint-env jasmine */

import { Point } from 'atom';

import { Focus } from '../lib/table.js';

describe('Focus', () => {
  describe('constructor(pos, offset)', () => {
    it('should create a new Focus instance', () => {
      const focus = new Focus(new Point(1, 2), 3);
      expect(focus).toBeInstanceOf(Focus);
      expect(focus.pos).toBeInstanceOf(Point);
      expect(focus.pos.row).toBe(1);
      expect(focus.pos.column).toBe(2);
      expect(focus.offset).toBe(3);
    });
  });

  describe('copy()', () => {
    it('should create a copy of the focus object', () => {
      const focus = new Focus(new Point(1, 2), 3);
      const copy = focus.copy();
      expect(copy).toBeInstanceOf(Focus);
      expect(copy).not.toBe(focus);
      expect(copy.pos).toBeInstanceOf(Point);
      expect(copy.pos).not.toBe(focus.pos);
      expect(copy.pos.row).toBe(1);
      expect(copy.pos.column).toBe(2);
      expect(copy.offset).toBe(3);
    });
  });
});
