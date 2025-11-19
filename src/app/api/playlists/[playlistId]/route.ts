import { NextResponse } from "next/server";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import type { Song } from "@/types/song";

const playlistDoc = (id: string) => doc(db, "playlists", id);
const songsCollection = collection(db, "songs");

// Helper that splits the song ID list to Firestore-friendly chunks and fetches each chunk in parallel.
const fetchSongsByIds = async (ids: string[]): Promise<Song[]> => {
  if (ids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }
  const queries = chunks.map((chunk) =>
    getDocs(query(songsCollection, where(documentId(), "in", chunk)))
  );
  const snapshots = await Promise.all(queries);
  const songMap = new Map<string, Song>();
  snapshots.forEach((snapshot) => {
    snapshot.forEach((docSnap) => {
      songMap.set(docSnap.id, {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Song, "id">),
      });
    });
  });
  return ids
    .map((id) => songMap.get(id))
    .filter((song): song is Song => Boolean(song));
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const user = await requireAuthenticatedUser(request);
  const { playlistId } = await params;
  const playlistSnap = await getDoc(playlistDoc(playlistId));
  if (!playlistSnap.exists()) {
    return NextResponse.json({ error: "Playlist not found." }, { status: 404 });
  }
  const playlistData = playlistSnap.data();
  if (playlistData.ownerUid !== user.uid) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const songIds: string[] = Array.isArray(playlistData.songIds)
    ? playlistData.songIds
    : [];
  const songs = await fetchSongsByIds(songIds);

  return NextResponse.json({
    playlist: {
      id: playlistId,
      name: playlistData.name || "Untitled playlist",
      songIds,
    },
    songs,
  });
}
