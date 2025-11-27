import { type Dictionary, insert, t } from "intlayer";

const moreDrawerContent = {
  content: {
    DensitySettingHeader: insert(
      t({
        en: "Density settings",
        uk: "Налаштування густини продукту",
      }),
    ),
    ReportHeader: insert(
      t({
        en: "Reports",
        uk: "Звіти",
      }),
    ),
    AdvancedSettingHeader: insert(
      t({
        en: "Advanced settings",
        uk: "Додаткові налаштування",
      }),
    ),
    ChooseLanguageLabel: insert(
      t({
        en: "Choose language",
        uk: "Оберіть мову",
      }),
    ),
  },
  key: "more-drawer",
} satisfies Dictionary;

export default moreDrawerContent;
