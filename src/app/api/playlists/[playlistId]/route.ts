import { NextResponse } from "next/server";
import { doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import type { Song } from "@/types/song";

const playlistDoc = (id: string) => doc(db, "playlists", id);
const songDoc = (id: string) => doc(db, "songs", id);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const user = await requireAuthenticatedUser();
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
  // Fetch song documents in parallel and filter out missing ones.
  const songs: Song[] = [];
  for (const id of songIds) {
    const snap = await getDoc(songDoc(id));
    if (snap.exists()) {
      songs.push({ id: snap.id, ...(snap.data() as Omit<Song, "id">) });
    }
  }

  return NextResponse.json({
    playlist: {
      id: playlistId,
      name: playlistData.name || "Untitled playlist",
      songIds,
    },
    songs,
  });
}
