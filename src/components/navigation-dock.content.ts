import { type Dictionary, insert, t } from "intlayer";

const localeSwitcherContent = {
  content: {
    dockTankLabel: insert(
      t({
        en: "Tank",
        es: "Tanke",
        fr: "Tankeur",
      }),
    ),
    dockTableLabel: insert(
      t({
        en: "Table",
        es: "Tables",
        fr: "Tableur",
      }),
    ),
    dockJournalLabel: insert(
      t({
        en: "Journal",
        es: "Journale",
        fr: "Journaluor",
      }),
    ),
    dockMoreLabel: insert(
      t({
        en: "More",
        es: "Tanke",
        fr: "tankeur",
      }),
    ),
  },
  key: "locale-switcher",
} satisfies Dictionary;

export default localeSwitcherContent;
