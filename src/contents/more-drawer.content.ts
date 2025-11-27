import { type Dictionary, t } from "intlayer";

const moreDrawerContent = {
  content: {
    DensitySettingHeader: t({
      en: "Density settings",
      uk: "Налаштування густини продукту",
    }),

    ReportHeader: t({
      en: "Reports",
      uk: "Звіти",
    }),

    AdvancedSettingHeader: t({
      en: "Advanced settings",
      uk: "Додаткові налаштування",
    }),

    ChooseLanguageLabel: t({
      en: "Choose language",
      uk: "Оберіть мову",
    }),
  },
  key: "more-drawer",
} satisfies Dictionary;

export default moreDrawerContent;
