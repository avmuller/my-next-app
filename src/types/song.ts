// src/types/song.ts (UPDATED)

/**
 * Canonical Song type used across the app.
 */
export interface Song {
  id: string;
  title: string;
  Beat: string;
  Key: string;
  Genre: string[];
  Event: string[];
  Theme: string;
  Composer: string;
  Singer: string;
  Season: string[];
  hasidut: string;
  Lyrics: string;
}

// SongForm mirrors Song for form usage, excluding DB-only props
export type SongForm = Omit<Song, "id">;
