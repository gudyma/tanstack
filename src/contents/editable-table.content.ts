import { type Dictionary, t } from "intlayer";

const editableTableContent = {
  content: {
    ToggleHeader: t({
      en: "Enter density at 15 C",
      uk: "Ввести густину при 15 С",
    }),

    ResetButtonHeader: t({
      en: "Reset Changes",
      uk: "Скинути",
    }),

    SaveButtonHeader: t({
      en: "Save Changes",
      uk: "Зберегти",
    }),
  },
  key: "editable-table",
} satisfies Dictionary;

export default editableTableContent;
