import type { Dictionary } from "intlayer";

import { t } from "intlayer";

const appContent = {
  content: {
    meta: {
      description: t({
        en: "This is an example of using Intlayer with TanStack Router",
        es: "Este es un ejemplo de uso de Intlayer con TanStack Router",
        fr: "Ceci est un exemple d'utilisation d'Intlayer avec TanStack Router",
      }),
    },
    title: t({
      en: "Welcome to Intlayer + TanStack Router TABLE",
      es: "Bienvenido a Intlayer + TanStack Router TABLE",
      fr: "Bienvenue à Intlayer + TanStack Router TABLE",
    }),
  },
  key: "tableContent",
} satisfies Dictionary;

export default appContent;
