export interface AdminSongPayload extends Record<string, unknown> {
  title: string;
  Beat: string[];
  Key: string;
  Theme: string[];
  Composer: string;
  Singer: string;
  hasidut: string;
  Lyrics: string;
  Season: string[];
  Genre: string[];
  Event: string[];
}
