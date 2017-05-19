# markdown-table-editor
Markdown table editor/formatter

![screenshot](https://github.com/susisu/markdown-table-editor/wiki/images/demo.gif)

## Features
* Format table
* Move cursor from cell to cell
* Alter column alignment
* Insert and delete rows and columns

### Commands
|     Name      |       Description       | Keybinding  |
| ------------- | ----------------------- | ----------- |
| Next Cell     | Move to next cell       | `tab`       |
| Previous Cell | Move to previous cell   | `shift-tab` |
| Next Row      | Move to next row        | `enter`     |
| Escape        | Escape from table       | `escape`    |
| Format        | Just format table       |             |
| Align Left    | Left-align column       |             |
| Align Right   | Right-align column      |             |
| Align Center  | Center-align column     |             |
| Align Default | Remove column alignment |             |
| Select Cell   | Select cell content     |             |
| Move Left     | Move to left cell       |             |
| Move Right    | Move to right cell      |             |
| Move Up       | Move to upper cell      |             |
| Move Down     | Move to lower cell      |             |
| Insert Row    | Insert an empty row     |             |
| Delete Row    | Delete current row      |             |
| Insert Column | Insert an empty column  |             |
| Delete Column | Delete current column   |             |

*NOTE: To input newline in table, press `shift-enter` (or some equivalent) instead.*

You can select commands from the command palette (`shift-ctrl-p` or `shift-cmd-p`), but it will be more convenient if you add some keybindings to your keymap file `keymap.cson`.
These are the ones which I use, for example:

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
