# markdown-table-editor
Markdown table editor/formatter

![screenshot](https://github.com/susisu/markdown-table-editor/wiki/images/demo.gif)

## Features
* Format tables
* Move the cursor from cell to cell
* Alter column's alignment
* Insert and delete rows and columns

### Commands
|        Name        |          Description          |            Keybinding             |
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
| Insert Column      | Insert an empty column        |                                   |
| Delete Column      | Delete the column             |                                   |
| Switch Format Type | Switch "Format Type" config   |                                   |

*NOTE: To input a newline purposely in a table, press <kbd>shift</kbd> + <kbd>enter</kbd> (or some equivalent) instead.*

You can execute commands from the command palette (Windows, Linux: <kbd>ctrl</kbd> + <kbd>shift</kbd> + <kbd>p</kbd> / macOS: <kbd>cmd</kbd> + <kbd>shift</kbd> + <kbd>p</kbd>) or from the Packages menu.

It will be more convenient if you add keybindings to your `keymap.cson`.
These are the ones which I use, FYI:

``` coffee
'atom-text-editor:not(.mini):not(.autocomplete-active).markdown-table-editor-active':
  'shift-cmd-left' : 'markdown-table-editor:align-left'
  'shift-cmd-right': 'markdown-table-editor:align-right'
  'shift-cmd-up'   : 'markdown-table-editor:align-center'
  'shift-cmd-down' : 'markdown-table-editor:align-default'
  'cmd-left'       : 'markdown-table-editor:move-left'
  'cmd-right'      : 'markdown-table-editor:move-right'
  'cmd-up'         : 'markdown-table-editor:move-up'
  'cmd-down'       : 'markdown-table-editor:move-down'
  'cmd-k cmd-i'    : 'markdown-table-editor:insert-row'
  'cmd-k alt-cmd-i': 'markdown-table-editor:delete-row'
  'cmd-k cmd-j'    : 'markdown-table-editor:insert-column'
  'cmd-k alt-cmd-j': 'markdown-table-editor:delete-column'
```
