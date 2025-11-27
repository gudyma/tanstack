import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const tablePageContent = {
  content: {
    meta: {
      description: t({
        en: "MIRA Web - Table",
        uk: "MIRA Web - Таблиця",
      }),
    },
    title: t({
      en: "MIRA Web - Table",
      uk: "MIRA Web - Таблиця",
    }),
  },
  key: "tableContent",
} satisfies Dictionary;

export default tablePageContent;
