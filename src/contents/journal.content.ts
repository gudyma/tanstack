import type { Dictionary } from "intlayer";
import { t } from "intlayer";

const journalPageContent = {
  content: {
    meta: {
      description: t({
        en: "MIRA Web - Journal",
        uk: "MIRA Web - Журнал",
      }),
    },
    title: t({
      en: "MIRA Web - Journal",
      uk: "MIRA Web - Журнал",
    }),
    TankSelectHeader: t({
      en: "Tank:",
      uk: "Резервуар:",
    }),
    SelectTankPlaceholder: t({
      en: "Select tank:",
      uk: "Оберіть резервуар:",
    }),
    DatetimeStartNote: t({
      en: "Start date:",
      uk: "Початкова дата:",
    }),
    DatetimeStartPlaceholder: t({
      en: "Select start date:",
      uk: "Оберіть початкову дату:",
    }),
    DatetimeEndNote: t({
      en: "End date:",
      uk: "Кінцева дата:",
    }),
    DatetimeEndPlaceholder: t({
      en: "Select end date:",
      uk: "Оберіть кінцеву дату:",
    }),
    UpdateData: t({
      en: "Update data",
      uk: "Оновити дані",
    }),
    UpdatingData: t({
      en: "Updating…",
      uk: "Оновлення…",
    }),
    InvalidDateRange: t({
      en: "Start date must be before or equal to end date.",
      uk: "Початкова дата має бути не пізніше кінцевої.",
    }),
    DataLoadError: t({
      en: "Could not load journal data. Please try again.",
      uk: "Не вдалося завантажити дані журналу. Спробуйте ще раз.",
    }),
    LeftYAxis: t({
      en: "Left Y axis",
      uk: "Ліва вісь Y",
    }),
    RightYAxis: t({
      en: "Right Y axis",
      uk: "Права вісь Y",
    }),
    SelectGraphParameters: t({
      en: "Select up to two parameters",
      uk: "Оберіть до двох параметрів",
    }),
    MaxAxisParameters: t({
      en: "You can select up to two parameters per axis.",
      uk: "Для кожної осі можна обрати до двох параметрів.",
    }),
    NoParametersFound: t({
      en: "No parameters found.",
      uk: "Параметрів не знайдено.",
    }),
  },

  key: "journalContent",
} satisfies Dictionary;

export default journalPageContent;
