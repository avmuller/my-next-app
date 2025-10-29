// src/data/categories.ts
export interface Category {
  key: string;
  label: string;
  icon: string;
}

export const primaryCategories: Category[] = [
  { key: "Genre", label: "ז׳אנרים", icon: "🎵" },
  { key: "artists", label: "אמנים/מבצעים", icon: "🎤" }, // שימו לב: השתמשנו כאן ב-'artists'
  { key: "Singer", label: "מבצעים", icon: "🎤" },
  { key: "Composer", label: "מלחינים", icon: "✍️" },
  { key: "Key", label: "סולמות", icon: "🎹" },
  { key: "Theme", label: "נושאים", icon: "💡" },
  { key: "Season", label: "עונות/תקופות", icon: "📅" },
  { key: "Event", label: "אירועים/שמחות", icon: "🎉" },
  { key: "Album", label: "אלבומים", icon: "💿" },
  { key: "hasidut", label: "חסידות", icon: "🕍" },
  { key: "Beat", label: "מקצב (Beat)", icon: "🥁" },
];
// ודא שאין איברים נוספים או שורות ריקות בתוך המערך או אחריו.
