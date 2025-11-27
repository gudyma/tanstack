import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const tankPageContent = {
  content: {
    meta: {
      description: t({
        en: "MIRA Web - Tanks",
        uk: "MIRA Web - Резервуари",
      }),
    },
    title: t({
      en: "MIRA Web - Tanks",
      uk: "MIRA Web - Резервуари",
    }),
  },
  key: "tankContent",
} satisfies Dictionary;

export default tankPageContent;
