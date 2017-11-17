import { Point, Range } from "@susisu/mte-kernel";

import TextEditorInterface from "../lib/text-editor-interface.js";

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

describe("TextEditorInterface", () => {
  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage("language-gfm"));
    waitsForPromise(() => atom.packages.activatePackage("language-text"));
    waitsForPromise(() => atom.packages.activatePackage("markdown-table-editor"));
  });

  describe("getCursorPosition()", () => {
    it("should get the current cursor position as a point object", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          editor.setCursorBufferPosition([0, 0]);
          {
            const pos = intf.getCursorPosition();
            expect(pos).toBeInstanceOf(Point);
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(0);
          }
          editor.setCursorBufferPosition([1, 2]);
          {
            const pos = intf.getCursorPosition();
            expect(pos).toBeInstanceOf(Point);
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(2);
          }
          editor.setCursorBufferPosition([4, 0]);
          {
            const pos = intf.getCursorPosition();
            expect(pos).toBeInstanceOf(Point);
            expect(pos.row).toBe(4);
            expect(pos.column).toBe(0);
          }
        })
      );
    });
  });

  describe("setCursorPosition(pos)", () => {
    it("should set the cursor position by a point object", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          intf.setCursorPosition(new Point(0, 0));
          {
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(0);
          }
          intf.setCursorPosition(new Point(1, 2));
          {
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(1);
            expect(pos.column).toBe(2);
          }
          intf.setCursorPosition(new Point(4, 0));
          {
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(4);
            expect(pos.column).toBe(0);
          }
        })
      );
    });
  });

  describe("setSelectionRange(range)", () => {
    it("should set a selection by a range object", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          intf.setSelectionRange(new Range(new Point(0, 0), new Point(1, 2)));
          {
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(0);
            expect(range.end.row).toBe(1);
            expect(range.end.column).toBe(2);
          }
          intf.setSelectionRange(new Range(new Point(1, 2), new Point(1, 3)));
          {
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(1);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(1);
            expect(range.end.column).toBe(3);
          }
          intf.setSelectionRange(new Range(new Point(1, 2), new Point(4, 0)));
          {
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(1);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(4);
            expect(range.end.column).toBe(0);
          }
        })
      );
    });
  });

  describe("getLastRow()", () => {
    it("should get the last row index of the text editor", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          expect(intf.getLastRow()).toBe(4);
        })
      );
    });
  });

  describe("acceptsTableEdit(row)", () => {
    it("should return true if the specified row is in a table", () => {
      {
        const lines = [
          "",
          "| A | B |",
          "| --- | ----- |",
          "| C | D |  ",
          "",
          "```",
          "| E | F |",
          "| --- | ----- |",
          "| G | H |  ",
          "```",
          ""
        ];
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
            const intf = new TextEditorInterface(editor, ["table.gfm"]);
            expect(intf.acceptsTableEdit(0)).toBe(false);
            expect(intf.acceptsTableEdit(1)).toBe(true);
            expect(intf.acceptsTableEdit(2)).toBe(true);
            expect(intf.acceptsTableEdit(3)).toBe(true);
            expect(intf.acceptsTableEdit(4)).toBe(false);
            expect(intf.acceptsTableEdit(5)).toBe(false);
            expect(intf.acceptsTableEdit(6)).toBe(false);
            expect(intf.acceptsTableEdit(7)).toBe(false);
            expect(intf.acceptsTableEdit(8)).toBe(false);
            expect(intf.acceptsTableEdit(9)).toBe(false);
            expect(intf.acceptsTableEdit(10)).toBe(false);
          })
        );
      }
      {
        const lines = [
          "",
          "| A | B |",
          " | --- | ----- |",
          "  | C | D |  ",
          "",
          "```",
          "| E | F |",
          " | --- | ----- |",
          "  | G | H |  ",
          "```",
          ""
        ];
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
            const intf = new TextEditorInterface(editor, ["source.gfm"]);
            expect(intf.acceptsTableEdit(0)).toBe(true);
            expect(intf.acceptsTableEdit(1)).toBe(true);
            expect(intf.acceptsTableEdit(2)).toBe(true);
            expect(intf.acceptsTableEdit(3)).toBe(true);
            expect(intf.acceptsTableEdit(4)).toBe(true);
            expect(intf.acceptsTableEdit(5)).toBe(true);
            expect(intf.acceptsTableEdit(6)).toBe(true);
            expect(intf.acceptsTableEdit(7)).toBe(true);
            expect(intf.acceptsTableEdit(8)).toBe(true);
            expect(intf.acceptsTableEdit(9)).toBe(true);
            expect(intf.acceptsTableEdit(10)).toBe(true);
          })
        );
      }
      {
        const lines = [
          "",
          "| A | B |",
          "| --- | ----- |",
          "| C | D |  ",
          ""
        ];
        waitsForPromise(() =>
          prepareEditor("test.txt", "text.plain", lines.join("\n")).then(editor => {
            const intf = new TextEditorInterface(editor, ["table.gfm"]);
            expect(intf.acceptsTableEdit(0)).toBe(false);
            expect(intf.acceptsTableEdit(1)).toBe(false);
            expect(intf.acceptsTableEdit(2)).toBe(false);
            expect(intf.acceptsTableEdit(3)).toBe(false);
            expect(intf.acceptsTableEdit(4)).toBe(false);
          })
        );
      }
    });
  });

  describe("getLine(row)", () => {
    it("should get a line without line ending at the specified row", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          expect(intf.getLine(0)).toBe("");
          expect(intf.getLine(1)).toBe("| A | B |");
          expect(intf.getLine(2)).toBe(" | --- | ----- |");
          expect(intf.getLine(3)).toBe("  | C | D |  ");
          expect(intf.getLine(4)).toBe("");
        })
      );
    });
  });

  describe("insertLine(row, line)", () => {
    it("should insert a new line at the specified row", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          intf.insertLine(0, "foo");
          {
            const text = editor.getText();
            expect(text).toBe(
              "foo\n"
              + "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "  | C | D |  \n"
            );
          }
          intf.insertLine(4, "| E | F |");
          {
            const text = editor.getText();
            expect(text).toBe(
              "foo\n"
              + "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "| E | F |\n"
              + "  | C | D |  \n"
            );
          }
          intf.insertLine(7, "bar");
          {
            const text = editor.getText();
            expect(text).toBe(
              "foo\n"
              + "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "| E | F |\n"
              + "  | C | D |  \n"
              + "\n"
              + "bar"
            );
          }
        })
      );
    });
  });

  describe("deleteLine(row)", () => {
    it("should delete a line at the specified row", () => {
      const lines = [
        "foo",
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        "| E | F |",
        "| G | H |",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          intf.deleteLine(0);
          {
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "  | C | D |  \n"
              + "| E | F |\n"
              + "| G | H |\n"
            );
          }
          intf.deleteLine(3);
          {
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "| E | F |\n"
              + "| G | H |\n"
            );
          }
          intf.deleteLine(5);
          {
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "| E | F |\n"
              + "| G | H |"
            );
          }
        })
      );
    });
  });

  describe("replaceLines(startRow, endRow, lines)", () => {
    it("should replace lines in the specified row range", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          {
            const newLines = [
              "|  A  |  B  |",
              "| --- | --- |",
              "|  C  |  D  |",
              "|  E  |  F  |"
            ];
            intf.replaceLines(1, 4, newLines);
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "|  A  |  B  |\n"
              + "| --- | --- |\n"
              + "|  C  |  D  |\n"
              + "|  E  |  F  |\n"
            );
          }
          {
            const newLines = [
              "|  G  |  H  |",
              "| --- | --- |",
              "|  I  |  J  |"
            ];
            intf.replaceLines(1, 6, newLines);
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "|  G  |  H  |\n"
              + "| --- | --- |\n"
              + "|  I  |  J  |"
            );
          }
        })
      );
    });
  });

  describe("transact(func)", () => {
    it("should batch operations as a single step", () => {
      const lines = [
        "",
        "| A | B |",
        " | --- | ----- |",
        "  | C | D |  ",
        ""
      ];
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", lines.join("\n")).then(editor => {
          const intf = new TextEditorInterface(editor, ["table.gfm"]);
          intf.transact(() => {
            intf.deleteLine(3);
            intf.insertLine(3, "| E | F |");
          });
          {
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "| E | F |\n"
            );
          }
          editor.undo();
          {
            const text = editor.getText();
            expect(text).toBe(
              "\n"
              + "| A | B |\n"
              + " | --- | ----- |\n"
              + "  | C | D |  \n"
            );
          }
        })
      );
    });
  });
});
