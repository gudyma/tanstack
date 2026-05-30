const _XZlhiQr36lyExCJTleWI = require('../dictionary/editable-table.json');
const _ny5H47T1wBgtISYgEhBl = require('../dictionary/indexContent.json');
const _lCHiKkEyIpDRnIqzoqSl = require('../dictionary/journalContent.json');
const _iNyir2shasQAaRqnD1OS = require('../dictionary/locale-switcher.json');
const _joEKDV6rjWzLLvWyfTeO = require('../dictionary/more-drawer.json');
const _TUxvMZYxjDJujIhoGmNc = require('../dictionary/navigation-dock.json');
const _AxtL3j9oCpY8ryKBRDTA = require('../dictionary/tableContent.json');
const _INpaybH7hjgu9MiKiCTR = require('../dictionary/tankContent.json');

const dictionaries = {
  "editable-table": _XZlhiQr36lyExCJTleWI,
  "indexContent": _ny5H47T1wBgtISYgEhBl,
  "journalContent": _lCHiKkEyIpDRnIqzoqSl,
  "locale-switcher": _iNyir2shasQAaRqnD1OS,
  "more-drawer": _joEKDV6rjWzLLvWyfTeO,
  "navigation-dock": _TUxvMZYxjDJujIhoGmNc,
  "tableContent": _AxtL3j9oCpY8ryKBRDTA,
  "tankContent": _INpaybH7hjgu9MiKiCTR
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
