import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuthenticatedUser } from "@/lib/auth/server";

const playlistDoc = (id: string) => doc(db, "playlists", id);

const assertOwnership = async (playlistId: string, uid: string) => {
  const ref = playlistDoc(playlistId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Playlist not found");
  }
  if (snap.data().ownerUid !== uid) {
    throw new Error("Forbidden");
  }
  return ref;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const user = await requireAuthenticatedUser();
  const body = await request.json();
  const songId = body?.songId as string;
  if (!songId) {
    return NextResponse.json(
      { error: "Missing songId." },
      { status: 400 }
    );
  }
  const resolvedParams = await params;
  const ref = await assertOwnership(resolvedParams.playlistId, user.uid);
  await updateDoc(ref, { songIds: arrayUnion(songId) });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const user = await requireAuthenticatedUser();
  const body = await request.json();
  const songId = body?.songId as string;
  if (!songId) {
    return NextResponse.json(
      { error: "Missing songId." },
      { status: 400 }
    );
  }
  const resolvedParams = await params;
  const ref = await assertOwnership(resolvedParams.playlistId, user.uid);
  await updateDoc(ref, { songIds: arrayRemove(songId) });
  return NextResponse.json({ success: true });
}
