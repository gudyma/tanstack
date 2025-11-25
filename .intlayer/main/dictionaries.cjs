const _3LpXGB2C6jr4NxjJUS1e = require('../dictionary/app.json');
const _1HPUjO10qFJDwXKZFFPf = require('../dictionary/locale-switcher.json');

const dictionaries = {
  "app": _3LpXGB2C6jr4NxjJUS1e,
  "locale-switcher": _1HPUjO10qFJDwXKZFFPf
};
const getDictionaries = () => dictionaries;

module.exports.getDictionaries = getDictionaries;
module.exports = dictionaries;
