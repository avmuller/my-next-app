// src/types/playlist.ts
export interface Playlist {
  id: string;
  ownerUid: string;
  name: string;
  songIds: string[];
}

export type NewPlaylist = Omit<Playlist, "id">;
export type PlaylistSummary = Pick<Playlist, "id" | "name" | "songIds">;
