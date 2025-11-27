import { type Dictionary, insert, t } from "intlayer";

const navigationDockContent = {
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
  key: "navigation-dock",
} satisfies Dictionary;

export default navigationDockContent;
