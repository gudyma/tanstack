const _b1yXE2kEMRDKMkTygo48 = require('../dictionary/editable-table.json');
const _aQbsagkRq5XvgxrXsw3N = require('../dictionary/indexContent.json');
const _cVwpOd2Cp6JlbCkrw2SE = require('../dictionary/journalContent.json');
const _1HPUjO10qFJDwXKZFFPf = require('../dictionary/locale-switcher.json');
const _um8o6mPnr5V3KewY07wF = require('../dictionary/more-drawer.json');
const _xeT33NDVANOGqQ2P8947 = require('../dictionary/navigation-dock.json');
const _vNXIh98AVRdHiccf0KUc = require('../dictionary/tableContent.json');
const _8XtVNeif9E92nub6nYCW = require('../dictionary/tankContent.json');

const dictionaries = {
  "editable-table": _b1yXE2kEMRDKMkTygo48,
  "indexContent": _aQbsagkRq5XvgxrXsw3N,
  "journalContent": _cVwpOd2Cp6JlbCkrw2SE,
  "locale-switcher": _1HPUjO10qFJDwXKZFFPf,
  "more-drawer": _um8o6mPnr5V3KewY07wF,
  "navigation-dock": _xeT33NDVANOGqQ2P8947,
  "tableContent": _vNXIh98AVRdHiccf0KUc,
  "tankContent": _8XtVNeif9E92nub6nYCW
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
