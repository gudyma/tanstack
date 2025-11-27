import { type Dictionary, insert, t } from "intlayer";

const navigationDockContent = {
  content: {
    dockTankLabel: t({
      en: "Tank",
      uk: "Резервуар",
    }),
    dockTableLabel: t({
      en: "Table",
      uk: "Таблиця",
    }),
    dockJournalLabel: t({
      en: "Journal",
      uk: "Журнал",
    }),
    dockMoreLabel: t({
      en: "More",
      uk: "Інше",
    }),
  },
  key: "navigation-dock",
} satisfies Dictionary;

export default navigationDockContent;
