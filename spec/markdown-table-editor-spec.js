import { Point } from "atom";
import { FormatType, DefaultAlignment, HeaderAlignment } from "@susisu/mte-kernel";

const NAMESPACE = "markdown-table-editor";

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

describe("markdown-table-editor", () => {
  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage("language-gfm"));
    waitsForPromise(() => atom.packages.activatePackage("markdown-table-editor"));
  });

  describe("activation", () => {
    it("should be activated if the current scope is specified in the config", () => {
      atom.config.set(`${NAMESPACE}.scopes`, ["source.gfm", "text.md"]);
      const text =
        "\n"
        + "| A | B |\n"
        + " | --- | ----- |\n"
        + "  | C | D |  \n";
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(true);
          editor.setCursorBufferPosition(new Point(2, 1));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(true);
          editor.setCursorBufferPosition(new Point(3, 2));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(true);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
        })
      );
    });

    it("should not be activated if the current scope is not specified in the config", () => {
      atom.config.set(`${NAMESPACE}.scopes`, ["text.md"]);
      const text =
        "\n"
        + "| A | B |\n"
        + " | --- | ----- |\n"
        + "  | C | D |  \n";
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", text).then(editor => {
          const elem = editor.getElement();
          editor.setCursorBufferPosition(new Point(0, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
          editor.setCursorBufferPosition(new Point(1, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
          editor.setCursorBufferPosition(new Point(2, 1));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
          editor.setCursorBufferPosition(new Point(3, 2));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
          editor.setCursorBufferPosition(new Point(4, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
        })
      );
    });

    it("should not be activated if there are multiple cursors", () => {
      atom.config.set(`${NAMESPACE}.scopes`, ["source.gfm", "text.md"]);
      const text =
        "\n"
        + "| A | B |\n"
        + " | --- | ----- |\n"
        + "  | C | D |  \n";
      waitsForPromise(() =>
        prepareEditor("test.md", "source.gfm", text).then(editor => {
          const elem   = editor.getElement();
          const cursor = editor.getLastCursor();
          cursor.setBufferPosition(new Point(1, 0));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(true);
          editor.addCursorAtBufferPosition(new Point(2, 1));
          expect(elem.classList.contains("markdown-table-editor-active")).toBe(false);
        })
      );
    });
  });

  describe("commands", () => {
    beforeEach(() => {
      atom.config.set(`${NAMESPACE}.formatOnSave`, false);
      atom.config.set(`${NAMESPACE}.scopes`, ["source.gfm", "text.md"]);
      atom.config.set(`${NAMESPACE}.leftMarginChars`, "");
      atom.config.set(`${NAMESPACE}.formatType`, FormatType.NORMAL);
      atom.config.set(`${NAMESPACE}.defaultAlignment`, DefaultAlignment.LEFT);
      atom.config.set(`${NAMESPACE}.headerAlignment`, HeaderAlignment.FOLLOW);
      atom.config.set(`${NAMESPACE}.minDelimiterWidth`, 3);
      atom.config.set(`${NAMESPACE}.ambiguousAsWide`, false);
      atom.config.set(`${NAMESPACE}.wideChars`, "");
      atom.config.set(`${NAMESPACE}.narrowChars`, "");
      atom.config.set(`${NAMESPACE}.normalize`, true);
      atom.config.set(`${NAMESPACE}.smartCursor`, false);
    });

    describe("toggle-format-on-save", () => {
      it("should toggle \"Format On Save\" config", () => {
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", "").then(editor => {
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(atom.config.get(`${NAMESPACE}.formatOnSave`)).toBe(false);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:toggle-format-on-save`);
            expect(atom.config.get(`${NAMESPACE}.formatOnSave`)).toBe(true);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:toggle-format-on-save`);
            expect(atom.config.get(`${NAMESPACE}.formatOnSave`)).toBe(false);
          })
        );
      });
    });

    describe("switch-format-type", () => {
      it("should switch \"Format Type\" config", () => {
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", "").then(editor => {
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:switch-format-type`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.WEAK);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:switch-format-type`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
          })
        );
      });
    });

    describe("set-format-type-normal", () => {
      it("should set \"Format Type\" to \"Normal\"", () => {
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", "").then(editor => {
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:set-format-type-normal`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
            atom.config.set(`${NAMESPACE}.formatType`, FormatType.WEAK);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:set-format-type-normal`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
          })
        );
      });
    });

    describe("set-format-type-weak", () => {
      it("should set \"Format Type\" to \"Weak\"", () => {
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", "").then(editor => {
            editor.setCursorBufferPosition(new Point(0, 0));
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.NORMAL);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:set-format-type-weak`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.WEAK);
            atom.config.set(`${NAMESPACE}.formatType`, FormatType.WEAK);
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:set-format-type-weak`);
            expect(atom.config.get(`${NAMESPACE}.formatType`)).toBe(FormatType.WEAK);
          })
        );
      });
    });

    describe("format", () => {
      it("should format the table", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:format`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("format-all", () => {
      it("should format all the tables", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n"
          + "\n"
          + "| E | F |\n"
          + " | --- | ----- |\n"
          + "  | G | H |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:format-all`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n"
              + "\n"
              + "| E   | F   |\n"
              + "| --- | --- |\n"
              + "| G   | H   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("escape", () => {
      it("should escape from the table", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:escape`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(3);
            expect(pos.column).toBe(0);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("align-left", () => {
      it("should align-left the column", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:align-left`);
            const formatted =
              "| A   | B   |\n"
              + "|:--- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("align-right", () => {
      it("should align-right the column", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:align-right`);
            const formatted =
              "|   A | B   |\n"
              + "| ---:| --- |\n"
              + "|   C | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(4);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("align-center", () => {
      it("should align-center the column", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:align-center`);
            const formatted =
              "|  A  | B   |\n"
              + "|:---:| --- |\n"
              + "|  C  | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(3);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("align-none", () => {
      it("should unset alignment of the column", () => {
        const text =
          "| A | B |\n"
          + " |:--- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:align-none`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("align-default", () => {
      it("should unset alignment of the column", () => {
        const text =
          "| A | B |\n"
          + " |:--- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:align-default`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("select-cell", () => {
      it("should select the focused cell content", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:select-cell`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("move-left", () => {
      it("should move the focus left", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 6));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-left`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("move-right", () => {
      it("should move the focus right", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-right`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(8);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(9);
          })
        );
      });
    });

    describe("move-up", () => {
      it("should move the focus up", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-up`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("move-down", () => {
      it("should move the focus down", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-down`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(2);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(2);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("next-cell", () => {
      it("should move the focus to the next cell", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 6));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:next-cell`);
            const formatted =
              "| A   | B   | \n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(14);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("previous-cell", () => {
      it("should move the focus to the previous cell", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 6));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:previous-cell`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("next-row", () => {
      it("should move the focus to the next row", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:next-row`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| C   | D   |\n"
              + "|     |     |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(3);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("insert-row", () => {
      it("should insert an empty row", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:insert-row`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "|     |     |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("delete-row", () => {
      it("should delete a row", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n"
          + "| E | F |\n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:delete-row`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| E   | F   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(2);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(2);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("move-row-up", () => {
      it("should move the focused row up", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n"
          + "| E | F |\n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(3, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-row-up`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| E   | F   |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(2);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("move-row-down", () => {
      it("should move the focused row down", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n"
          + "| E | F |\n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(2, 4));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-row-down`);
            const formatted =
              "| A   | B   |\n"
              + "| --- | --- |\n"
              + "| E   | F   |\n"
              + "| C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(3);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("insert-column", () => {
      it("should insert an empty column", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:insert-column`);
            const formatted =
              "|     | A   | B   |\n"
              + "| --- | --- | --- |\n"
              + "|     | C   | D   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("delete-column", () => {
      it("should delete a column", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:delete-column`);
            const formatted =
              "| B   |\n"
              + "| --- |\n"
              + "| D   |\n";
            expect(editor.getText()).toBe(formatted);
            const range = editor.getSelectedBufferRange();
            expect(range.start.row).toBe(0);
            expect(range.start.column).toBe(2);
            expect(range.end.row).toBe(0);
            expect(range.end.column).toBe(3);
          })
        );
      });
    });

    describe("move-column-left", () => {
      it("should move the focused column left", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 6));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-column-left`);
            const formatted =
                "| B   | A   |\n"
              + "| --- | --- |\n"
              + "| D   | C   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(2);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });

    describe("move-column-right", () => {
      it("should move the focused column right", () => {
        const text =
          "| A | B |\n"
          + " | --- | ----- |\n"
          + "  | C | D |  \n";
        waitsForPromise(() =>
          prepareEditor("test.md", "source.gfm", text).then(editor => {
            editor.setCursorBufferPosition(new Point(0, 2));
            atom.commands.dispatch(editor.getElement(), `${NAMESPACE}:move-column-right`);
            const formatted =
                "| B   | A   |\n"
              + "| --- | --- |\n"
              + "| D   | C   |\n";
            expect(editor.getText()).toBe(formatted);
            const pos = editor.getCursorBufferPosition();
            expect(pos.row).toBe(0);
            expect(pos.column).toBe(8);
            expect(editor.getSelectedBufferRange().isEmpty()).toBe(true);
          })
        );
      });
    });
  });
});
