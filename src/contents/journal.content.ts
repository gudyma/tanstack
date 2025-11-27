import type { Dictionary } from "intlayer";

import { t } from "intlayer";

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
  },
  key: "journalContent",
} satisfies Dictionary;

export default journalPageContent;
