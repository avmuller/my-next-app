// src/data/categories.ts (EN)

export interface Category {
  key: string;
  label: string;
  icon: string;
}

export const primaryCategories: Category[] = [
  { key: "Event", label: "Event", icon: "🎉" },
  { key: "Season", label: "Season", icon: "📅" },
  { key: "Theme", label: "Theme", icon: "💡" },
  { key: "Singer", label: "Singer", icon: "🎤" },
  { key: "Composer", label: "Composer", icon: "✍️" },
  { key: "Genre", label: "Genre", icon: "🎵" },
  { key: "hasidut", label: "Chasidic", icon: "🕍" },
];
