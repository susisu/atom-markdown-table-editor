# markdown-table-editor
Markdown table editor/formatter

![screenshot](https://github.com/susisu/markdown-table-editor/wiki/images/demo.gif)

## Quick guide
0. Set editor's grammar to `GitHub Markdown` or `Markdown`.
1. Input a pipe `|` and some content (cursor position is indicated by `_`).
    ``` markdown
    | foo_
    ```
    (If you are using [language-markdown](https://atom.io/packages/language-markdown), don't forget a   space after the pipe.)
2. Hit <kbd>tab</kbd> to move to the next cell.
    ``` markdown
    | foo | _
    | --- |
    ```
3. Continue typing.
    ``` markdown
    | foo | bar | _
    | --- | --- |
    ```
4. Hit <kbd>enter</kbd> to move to the next row.
    ``` markdown
    | foo | bar |
    | --- | --- |
    | _   |     |
    ```
5. Continue typing...
    ``` markdown
    | foo | bar |
    | --- | --- |
    | baz | _   |
    ```
6. Hit <kbd>esc</kbd> to finish editing table.
    ``` markdown
    | foo | bar |
    | --- | --- |
    | baz |     |
    _
    ```

## Features
* Format tables
* Move the cursor from cell to cell
* Alter column's alignment
* Insert and delete rows and columns

### Commands
| Name               | Description                   | Keybinding                        |
| ------------------ | ----------------------------- | --------------------------------- |
| Next Cell          | Move to the next cell         | <kbd>tab</kbd>                    |
| Previous Cell      | Move to the previous cell     | <kbd>shift</kbd> + <kbd>tab</kbd> |
| Next Row           | Move to the next row          | <kbd>enter</kbd>                  |
| Escape             | Escape from the table         | <kbd>escape</kbd>                 |
| Format             | Just format the table         |                                   |
| Align Left         | Left-align the column         |                                   |
| Align Right        | Right-align the column        |                                   |
| Align Center       | Center-align the column       |                                   |
| Align Default      | Remove the column's alignment |                                   |
| Select Cell        | Select the cell content       |                                   |
| Move Left          | Move to the left cell         |                                   |
| Move Right         | Move to the right cell        |                                   |
| Move Up            | Move to the upper cell        |                                   |
| Move Down          | Move to the lower cell        |                                   |
| Insert Row         | Insert an empty row           |                                   |
| Delete Row         | Delete the row                |                                   |
| Move Row Up        | Move the row up               |                                   |
| Move Row Down      | Move the row down             |                                   |
| Insert Column      | Insert an empty column        |                                   |
| Delete Column      | Delete the column             |                                   |
| Move Column Left   | Move the column left          |                                   |
| Move Column Right  | Move the column right         |                                   |
| Switch Format Type | Switch "Format Type" config   |                                   |

*NOTE: To input a newline purposely in a table, press <kbd>shift</kbd> + <kbd>enter</kbd> (or some equivalent) instead.*

You can execute commands from the command palette (Windows, Linux: <kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>p</kbd> / macOS: <kbd>cmd</kbd> + <kbd>shift</kbd> + <kbd>p</kbd>) or from the Packages menu.

It will be more convenient if you add keybindings to your `keymap.cson`.
These are the ones which I use, FYI:

``` coffee
'atom-text-editor:not(.mini):not(.autocomplete-active).markdown-table-editor-active':
  'cmd-left'           : 'markdown-table-editor:move-left'
  'cmd-right'          : 'markdown-table-editor:move-right'
  'cmd-up'             : 'markdown-table-editor:move-up'
  'cmd-down'           : 'markdown-table-editor:move-down'
  'shift-cmd-left'     : 'markdown-table-editor:align-left'
  'shift-cmd-right'    : 'markdown-table-editor:align-right'
  'shift-cmd-up'       : 'markdown-table-editor:align-center'
  'shift-cmd-down'     : 'markdown-table-editor:align-default'
  'alt-shift-cmd-left' : 'markdown-table-editor:move-column-left'
  'alt-shift-cmd-right': 'markdown-table-editor:move-column-right'
  'alt-shift-cmd-up'   : 'markdown-table-editor:move-row-up'
  'alt-shift-cmd-down' : 'markdown-table-editor:move-row-down'
  'cmd-k cmd-i'        : 'markdown-table-editor:insert-row'
  'cmd-k alt-cmd-i'    : 'markdown-table-editor:delete-row'
  'cmd-k cmd-j'        : 'markdown-table-editor:insert-column'
  'cmd-k alt-cmd-j'    : 'markdown-table-editor:delete-column'
```
