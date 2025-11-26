export const languages = {
	en: "English",
	uk: "Українська",
};

export const defaultLang = "uk";

export const showDefaultLang = false;

export const ui = {
	en: {
		"nav.home": "Home",
		"nav.tank": "Tanks",
		"nav.table": "Table",
		"nav.journal": "Journal",
		"nav.report": "Reports",
		"nav.more": "More",
		"table.chooseColumns": "Choose columns",
		"table.exportPdf": "Export PDF",
		"table.exportExcel": "Export Excel",
		"table.chooseAll": "Choose all",
	},
	uk: {
		"nav.home": "Головна",
		"nav.tank": "Емності",
		"nav.table": "Таблиця",
		"nav.journal": "Журнал",
		"nav.report": "Звіти",
		"nav.more": "Більше",
		"table.chooseColumns": "Обрати колонки",
		"table.exportPdf": "Еспортувати PDF",
		"table.exportExcel": "Експортувати Excel",
		"table.chooseAll": "Обрати все",
	},
} as const;

export const i18n = {
	defaultLocale: "uk",
	locales: ["uk", "en"],
} as const;

export type Locale = (typeof i18n)["locales"][number];
