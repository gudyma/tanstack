import { type Dictionary, insert, t } from "intlayer";

const localeSwitcherContent = {
  content: {
    dockTankLabel: insert(
      t({
        en: "Tank",
        uk: "Резервуар",
      }),
    ),
    dockTableLabel: insert(
      t({
        en: "Table",
        uk: "Таблиця",
      }),
    ),
    dockJournalLabel: insert(
      t({
        en: "Journal",
        uk: "Журнал",
      }),
    ),
    dockMoreLabel: insert(
      t({
        en: "More",
        uk: "Інше",
      }),
    ),
  },
  key: "locale-switcher",
} satisfies Dictionary;

export default localeSwitcherContent;
