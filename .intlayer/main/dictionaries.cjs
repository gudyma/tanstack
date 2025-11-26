const _aQbsagkRq5XvgxrXsw3N = require('../dictionary/indexContent.json');
const _cVwpOd2Cp6JlbCkrw2SE = require('../dictionary/journalContent.json');
const _1HPUjO10qFJDwXKZFFPf = require('../dictionary/locale-switcher.json');
const _vNXIh98AVRdHiccf0KUc = require('../dictionary/tableContent.json');
const _8XtVNeif9E92nub6nYCW = require('../dictionary/tankContent.json');

const dictionaries = {
  "indexContent": _aQbsagkRq5XvgxrXsw3N,
  "journalContent": _cVwpOd2Cp6JlbCkrw2SE,
  "locale-switcher": _1HPUjO10qFJDwXKZFFPf,
  "tableContent": _vNXIh98AVRdHiccf0KUc,
  "tankContent": _8XtVNeif9E92nub6nYCW
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
