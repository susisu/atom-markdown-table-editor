'use babel';

/* eslint-env jasmine */
/* global waitsForPromise */

import { Point } from 'atom';

function prepareEditor(name, scope, text) {
  return atom.workspace.open(name)
    .then(editor => {
      const grammar = atom.grammars.grammarForScopeName(scope);
      expect(grammar).not.toBe(undefined);
      editor.setGrammar(grammar);
      editor.setText(text);
      return editor;
    });
}

describe('markdown-table-editor', () => {
  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage('language-gfm'));
    waitsForPromise(() => atom.packages.activatePackage('markdown-table-editor'));
  });

  describe('activation', () => {
    it('should activate table editor if the grammar is contained in the config', () => {
      atom.config.set('markdown-table-editor.grammars', ['source.gfm', 'text.md']);
      const text
        = '\n'
        + '| A | B | C | D |\n'
        + ' | ---- |:---- | ----:|:----:| \n'
        + '  | E | F | G | H |  \n';
      waitsForPromise(() =>
        prepareEditor('test.md', 'source.gfm', text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(2, 1));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(3, 2));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(true);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
        })
      );
    });

    it('should not activate table editor if the grammar is not contained in the config', () => {
      atom.config.set('markdown-table-editor.grammars', ['text.md']);
      const text
        = '\n'
        + '| A | B | C | D |\n'
        + ' | ---- |:---- | ----:|:----:| \n'
        + '  | E | F | G | H |  \n';
      waitsForPromise(() =>
        prepareEditor('test.md', 'source.gfm', text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(2, 5));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(3, 10));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains('markdown-table-editor-active')).toBe(false);
        })
      );
    });
  });
});
