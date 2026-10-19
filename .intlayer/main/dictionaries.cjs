const _2fw7on30na = require('../dictionary/editable-table.json');
const _1neqjg6cn9j = require('../dictionary/indexContent.json');
const _1ht9njrs2wf = require('../dictionary/journalContent.json');
const _fpgb1frr4n = require('../dictionary/locale-switcher.json');
const _oto29ohgju = require('../dictionary/more-drawer.json');
const _19zc3lbt2ge = require('../dictionary/navigation-dock.json');
const _1ers2gh9flc = require('../dictionary/tableContent.json');
const _1kutmv3s3uv = require('../dictionary/tankContent.json');

const dictionaries = {
  "editable-table": _2fw7on30na,
  "indexContent": _1neqjg6cn9j,
  "journalContent": _1ht9njrs2wf,
  "locale-switcher": _fpgb1frr4n,
  "more-drawer": _oto29ohgju,
  "navigation-dock": _19zc3lbt2ge,
  "tableContent": _1ers2gh9flc,
  "tankContent": _1kutmv3s3uv
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
