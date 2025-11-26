import { type Dictionary, insert, t } from "intlayer";

const localeSwitcherContent = {
  content: {
    languageListLabel: t({
      en: "Language list",
      uk: "Cписок мов",
    }),
    localeSwitcherLabel: insert(
      t({
        en: "Select language {{language}}",
        uk: "Оберіть мову {{language}}",
      }),
    ),
  },
  key: "locale-switcher",
} satisfies Dictionary;

export default localeSwitcherContent;
