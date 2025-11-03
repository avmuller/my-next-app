// src/types/song.ts (UPDATED)

/**
 * הממשק המלא עבור אובייקט שיר.
 */
export interface Song {
  id: string;
  title: string; // Song
  Beat: string; // **חדש: שדה Beat**
  Key: string;
  year: number;
  Genre: string[];
  Event: string[];
  Theme: string;
  Composer: string;
  Singer: string;
  Season: string[];
  Album: string;
  hasidut: string;
  Lyrics: string;
  createdAt?: Date;
}

// SongForm יכלול את year כמחרוזת כי זה מה שנקבל מה-Input
export type SongForm = Omit<Song, "id" | "createdAt" | "year"> & {
  year: string;
};
