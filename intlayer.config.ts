import type { IntlayerConfig } from "intlayer";

import { Locales } from "intlayer";

const config: IntlayerConfig = {
  routing: {
    enableProxy: false, // Default: true
  },
  internationalization: {
    defaultLocale: Locales.UKRAINIAN,
    locales: [Locales.UKRAINIAN, Locales.ENGLISH],
  },
};

export default config;
