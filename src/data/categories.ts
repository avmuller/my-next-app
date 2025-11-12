// src/data/categories.ts (EN)
// Purpose: Define the Category shape and the default list
// of categories used by components (e.g., CategoryGrid).
// Consumers treat `icon` as an opaque display string.

// Describes a single category entity
export interface Category {
  key: string;
  label: string;
  icon: string;
}

// Primary categories shown when no custom list is provided
export const primaryCategories: Category[] = [
  { key: "Event", label: "Event", icon: "🎉" },
  { key: "Season", label: "Season", icon: "📅" },
  { key: "Theme", label: "Theme", icon: "💡" },
  { key: "Singer", label: "Singer", icon: "🎤" },
  { key: "Composer", label: "Composer", icon: "✍️" },
  { key: "Genre", label: "Genre", icon: "🎵" },
  { key: "hasidut", label: "Chasidic", icon: "🕍" },
];
