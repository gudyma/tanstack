import { t, type Dictionary } from "intlayer";

const dateTimeRangePickerContent = {
  key: "date-time-range-picker",
  content: {
    range: t({ en: "Date and time range", uk: "Період дати й часу" }),
    presets: t({ en: "Quick selection", uk: "Швидкий вибір" }),
    custom: t({ en: "Custom range", uk: "Довільний період" }),
    today: t({ en: "Today", uk: "Сьогодні" }),
    yesterday: t({ en: "Yesterday", uk: "Вчора" }),
    lastMonth: t({ en: "Last month", uk: "Останній місяць" }),
    thisWeek: t({ en: "This week", uk: "Поточний тиждень" }),
    thisMonth: t({ en: "This month", uk: "Поточний місяць" }),
    previousMonth: t({ en: "Previous month", uk: "Минулий місяць" }),
    quarter4: t({ en: "4th quarter", uk: "4 квартал" }),
    quarter3: t({ en: "3rd quarter", uk: "3 квартал" }),
    quarter2: t({ en: "2nd quarter", uk: "2 квартал" }),
    quarter1: t({ en: "1st quarter", uk: "1 квартал" }),
    thisYear: t({ en: "This year", uk: "Поточний рік" }),
    previousYear: t({ en: "Previous year", uk: "Минулий рік" }),
    startDate: t({ en: "Start date", uk: "Дата початку" }),
    endDate: t({ en: "End date", uk: "Дата завершення" }),
    startTime: t({ en: "Start time", uk: "Час початку" }),
    endTime: t({ en: "End time", uk: "Час завершення" }),
    hours: t({ en: "Hours", uk: "Години" }),
    minutes: t({ en: "Minutes", uk: "Хвилини" }),
    dateFormat: t({ en: "DD.MM.YYYY", uk: "ДД.ММ.РРРР" }),
    navigation: t({ en: "Calendar navigation", uk: "Навігація календарем" }),
    previousCalendarMonth: t({ en: "Previous month", uk: "Попередній місяць" }),
    nextCalendarMonth: t({ en: "Next month", uk: "Наступний місяць" }),
    selected: t({ en: "selected", uk: "вибрано" }),
    cancel: t({ en: "Cancel", uk: "Скасувати" }),
    apply: t({ en: "Apply", uk: "Застосувати" }),
    invalidDate: t({
      en: "Enter valid dates in DD.MM.YYYY format.",
      uk: "Введіть коректні дати у форматі ДД.ММ.РРРР.",
    }),
    reversedRange: t({
      en: "Start date and time must not be after the end.",
      uk: "Дата й час початку не можуть бути пізніше завершення.",
    }),
    futureDate: t({
      en: "Choose dates no later than today.",
      uk: "Оберіть дати не пізніше сьогоднішньої.",
    }),
  },
} satisfies Dictionary;

export default dateTimeRangePickerContent;
