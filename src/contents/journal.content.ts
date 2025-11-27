import type { Dictionary } from "intlayer";
import { insert, t } from "intlayer";

const journalPageContent = {
  content: {
    meta: {
      description: t({
        en: "This is an example of using Intlayer with TanStack Router",
        uk: "Приклад TanStack Router",
      }),
    },
    title: t({
      en: "Welcome to Intlayer + TanStack Router JOURNAL",
      uk: "Привіт + TanStack Router JOURNAL",
    }),
    TankSelectHeader: t({
      en: "Tank:",
      uk: "Резервуар:",
    }),
    SelectTankPlaceholder: t({
      en: "Select tank:",
      uk: "Оберіть резервуар:",
    }),
    DatetimeStartNote: t({
      en: "Start date:",
      uk: "Початкова дата:",
    }),
    DatetimeStartPlaceholder: t({
      en: "Select start date:",
      uk: "Оберіть початкову дату:",
    }),
    DatetimeEndNote: t({
      en: "End date:",
      uk: "Кінцева дата:",
    }),
    DatetimeEndPlaceholder: t({
      en: "Select end date:",
      uk: "Оберіть кінцеву дату:",
    }),
  },

  key: "journalContent",
} satisfies Dictionary;

export default journalPageContent;
