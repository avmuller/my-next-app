// src/lib/admin-config.ts
import { Song, SongForm } from "@/types/song";

// Fields that map to a single string value; used to build autocomplete lists
export const SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE: (keyof Song)[] = [
  "Singer",
  "Composer",
  "Key",
  "hasidut",
];

// Fields that are arrays on the Song object
export const MULTI_VALUE_FIELDS: (keyof Song)[] = [
  "Genre",
  "Event",
  "Season",
  "Theme",
  "Beat",
];

// Combined list of fields we query across to collect unique values
export const FIELDS_FOR_UNIQUE_FETCH = [
  ...SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE,
  ...MULTI_VALUE_FIELDS,
];

// Initial state for the admin form
export const initialSongState: SongForm = {
  title: "",
  Beat: [],
  Key: "",
  Genre: [],
  Event: [],
  Theme: [],
  Composer: "",
  Singer: "",
  Season: [],
  hasidut: "",
  Lyrics: "",
};

// Utility: split a comma-separated string into a clean string array
export const splitAndClean: (value: string | string[]) => string[] = (
  value
) => {
  if (Array.isArray(value))
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};
