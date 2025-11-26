import type { IntlayerConfig } from "intlayer";

import { Locales } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    defaultLocale: Locales.UKRAINIAN,
    locales: [Locales.UKRAINIAN, Locales.ENGLISH],
  },
};

export default config;
