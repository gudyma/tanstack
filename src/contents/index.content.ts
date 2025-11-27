import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const appContent = {
  content: {
    meta: {
      description: t({
        en: "MIRA Web",
        uk: "MIRA Web",
      }),
    },
    title: t({
      en: "MIRA Web",
      uk: "MIRA Web",
    }),
  },
  key: "indexContent",
} satisfies Dictionary;

export default appContent;
