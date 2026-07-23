const _is5qsl7nki = require('../dictionary/editable-table.json');
const _ycd3ihzg6q = require('../dictionary/indexContent.json');
const _1bc4fbv4vs8 = require('../dictionary/journalContent.json');
const _exb1ilkxdo = require('../dictionary/locale-switcher.json');
const _287ukasrbyn = require('../dictionary/more-drawer.json');
const _2bpfxftndfv = require('../dictionary/navigation-dock.json');
const _144jhy9sp0b = require('../dictionary/tableContent.json');
const _gjp7tmeuax = require('../dictionary/tankContent.json');

const dictionaries = {
  "editable-table": _is5qsl7nki,
  "indexContent": _ycd3ihzg6q,
  "journalContent": _1bc4fbv4vs8,
  "locale-switcher": _exb1ilkxdo,
  "more-drawer": _287ukasrbyn,
  "navigation-dock": _2bpfxftndfv,
  "tableContent": _144jhy9sp0b,
  "tankContent": _gjp7tmeuax
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
