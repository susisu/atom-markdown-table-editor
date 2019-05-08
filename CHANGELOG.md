## 1.1.2
* Update dependencies
  * In particular, update Unicode East Asian Width to 12.1.0

## 1.1.1
* Add "Set Format Type" commands that can explicitly change "Format Type" config
* Show notifications when config is changed by the commands

## 1.1.0
* Add "Left Margin Characters" config
    - For example, you can enable markdown-table-editor in JavaScript comments by adding `comment.block.documentation.js` to "Scopes" and `*` to "Left Margin Characters".

## 1.0.2
* Disable Esc keymap in [vim-mode-plus](https://atom.io/packages/vim-mode-plus)

## 1.0.1
* Fix a problem about smart cursor

## 1.0.0
* Overhauled using [mte-kernel](https://github.com/susisu/mte-kernel)
* Add "Format All" command
* Add "Format On Save" option and "Toggle Format On Save" command
* Add "Unicode Normalization" option for computing text widths
* Enable "Smart Cursor" by default
* Rename some options (old ones will be automatically migrated to the new ones)

## 0.6.4
* Add "Move Row" and "Move Column" commands

## 0.6.3
* Add config to change default cell alignment and header cell alignment

## 0.6.2
* Add menu items
* Add "Format Type" config, which specifies how a table is formatted on each operation
* Add a command to switch the format type

## 0.6.1
* Fix error when trying to align a column but the cursor is out of the table ([#4](https://github.com/susisu/markdown-table-editor/issues/4))

## 0.6.0
* Use scopes instead of grammar to determine active or not
    - The default config is changed from `source.gfm, text.md` to `table.gfm, table.storage.md`

## 0.5.2
* Small improvements

## 0.5.1
* Replace library for computing East Asian Width property

## 0.5.0
* Always enable Unicode East Asian Width features
* Disable "Treat East Asian Ambiguous Characters As Wide" by default

## 0.4.4
* Add "Always Wide/Narrow Characters" settings, allows to override character width

## 0.4.3
* Small change

## 0.4.2
* Add "Treat East Asian Ambiguous Characters As Wide" option

## 0.4.1
* Improve settings' descriptions

## 0.4.0
* Modify behavior of "Next Cell"
    - To move to the next row from the right end, press `enter` instead of `tab`

## 0.3.0
* Add "Smart Cursor" option, which enables more sophisticated cursor movement (like MS Office)
* Small changes

## 0.2.0
* Add more commands
* Small improvements

## 0.1.1
* Adds description in `package.json`

## 0.1.0
* First release
