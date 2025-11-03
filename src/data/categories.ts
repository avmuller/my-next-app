// src/data/categories.ts

export interface Category {
  key: string;

  label: string;

  icon: string;
}

export const primaryCategories: Category[] = [
  { key: "Event", label: "אירוע", icon: "🎉" },

  { key: "Season", label: "עונה", icon: "📅" },

  { key: "Theme", label: "נושא", icon: "💡" },

  { key: "Singer", label: "מבצע", icon: "🎤" },

  { key: "Composer", label: "מלחין", icon: "✍️" },

  { key: "Genre", label: "ז'אנר", icon: "🎵" },

  { key: "hasidut", label: "חסידות", icon: "🕍" },
];
