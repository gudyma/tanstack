import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const tablePageContent = {
  content: {
    meta: {
      description: t({
        en: "This is an example of using Intlayer with TanStack Router",
        uk: "Приклад TanStack Router",
      }),
    },
    title: t({
      en: "Welcome to Intlayer + TanStack Router TABLE",
      uk: "Привіт + TanStack Router TABLE",
    }),
  },
  key: "tableContent",
} satisfies Dictionary;

export default tablePageContent;
