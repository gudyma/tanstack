const _ERSBc4KJyTmebuwNNscd = require('../unmerged_dictionary/indexContent.json');
const _6OwAjs5w3xgoDDTSCb3x = require('../unmerged_dictionary/journalContent.json');
const _082r44rfcSJHdruhzKiP = require('../unmerged_dictionary/locale-switcher.json');
const _sVZ0PRZgEgLSe0EfronX = require('../unmerged_dictionary/tableContent.json');
const _8JtgK0dQmEggDlzvIR2O = require('../unmerged_dictionary/tankContent.json');

const dictionaries = {
  "indexContent": _ERSBc4KJyTmebuwNNscd,
  "journalContent": _6OwAjs5w3xgoDDTSCb3x,
  "locale-switcher": _082r44rfcSJHdruhzKiP,
  "tableContent": _sVZ0PRZgEgLSe0EfronX,
  "tankContent": _8JtgK0dQmEggDlzvIR2O
};
const getUnmergedDictionaries = () => dictionaries;

module.exports.getUnmergedDictionaries = getUnmergedDictionaries;
module.exports = dictionaries;
