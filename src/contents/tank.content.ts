import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const tankPageContent = {
  content: {
    meta: {
      description: t({
        en: "This is an example of using Intlayer with TanStack Router",
        uk: "Приклад  TanStack Router",
      }),
    },
    title: t({
      en: "Welcome to Intlayer + TanStack Router TANK",
      uk: "Укр. + TanStack Router TANK",
    }),
  },
  key: "tankContent",
} satisfies Dictionary;

export default tankPageContent;
