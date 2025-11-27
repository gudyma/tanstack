import { type Dictionary, insert, t } from "intlayer";

const editableTableContent = {
  content: {
    ToggleHeader: insert(
      t({
        en: "Enter density at 15 C",
        uk: "Ввести густину при 15 С",
      }),
    ),
    ResetButtonHeader: insert(
      t({
        en: "Reset Changes",
        uk: "Скинути",
      }),
    ),
    SaveButtonHeader: insert(
      t({
        en: "Save Changes",
        uk: "Зберегти",
      }),
    ),
  },
  key: "editable-table",
} satisfies Dictionary;

export default editableTableContent;
