// src/types/song.ts (UPDATED)

/**
 * הממשק המלא עבור אובייקט שיר.
 */
export interface Song {
  id: string;
  title: string; // Song
  Beat: string; // **חדש: שדה Beat**
  Key: string;
  Genre: string[];
  Event: string[];
  Theme: string;
  Composer: string;
  Singer: string;
  Season: string;
  Album: string;
  hasidut: string;
  Lyrics: string;
  createdAt?: Date;
}

export type SongForm = Omit<Song, "id" | "createdAt">;
