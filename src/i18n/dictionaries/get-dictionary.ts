import { Locales, type LocalesValues } from "intlayer";

// Column definitions are loaded lazily per locale; Ukrainian is the default.
const byLocale = <T>(
  locale: LocalesValues,
  loaders: { uk: () => Promise<T>; en: () => Promise<T> },
) => (locale === Locales.ENGLISH ? loaders.en : loaders.uk)();

export const getColumns = (locale: LocalesValues) =>
  byLocale(locale, {
    uk: () => import("./uk-columns").then((m) => m.tankTableColumns),
    en: () => import("./en-columns").then((m) => m.tankTableColumns),
  });

export const getJournalColumns = (locale: LocalesValues) =>
  byLocale(locale, {
    uk: () => import("./uk-columns").then((m) => m.journalColumns),
    en: () => import("./en-columns").then((m) => m.journalColumns),
  });

export const getGasContentColumns = (locale: LocalesValues) =>
  byLocale(locale, {
    uk: () => import("./uk-gasContent").then((m) => m.gasContentColumns),
    en: () => import("./en-gasContent").then((m) => m.gasContentColumns),
  });
