import { type Locale, i18n } from "@/i18n/ui";

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types

const columns = {
  uk: () =>
    import("@/i18n/dictionaries/uk-columns").then(
      (module) => module.tankTableColumns,
    ),
  en: () =>
    import("@/i18n/dictionaries/en-columns").then(
      (module) => module.tankTableColumns,
    ),
};

const journalColumns = {
  uk: () =>
    import("@/i18n/dictionaries/uk-columns").then(
      (module) => module.journalColumns,
    ),
  en: () =>
    import("@/i18n/dictionaries/en-columns").then(
      (module) => module.journalColumns,
    ),
};

const gasContentColumns = {
  uk: () =>
    import("@/i18n/dictionaries/uk-gasContent").then(
      (module) => module.gasContentColumns,
    ),
  en: () =>
    import("@/i18n/dictionaries/en-gasContent").then(
      (module) => module.gasContentColumns,
    ),
};

export const getColumns = async (locale: Locale) =>
  columns[i18n.locales.includes(locale) ? locale : i18n.defaultLocale]();

export const getJournalColumns = async (locale: Locale) =>
  journalColumns[i18n.locales.includes(locale) ? locale : i18n.defaultLocale]();

export const getGasContentColumns = async (locale: Locale) =>
  gasContentColumns[
    i18n.locales.includes(locale) ? locale : i18n.defaultLocale
  ]();
