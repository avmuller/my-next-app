import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { requireAuthenticatedUser } from "@/lib/auth/server";

const playlistsCollection = collection(db, "playlists");

// Helper to ensure playlist names are reasonable in size, even if user submits a long value.
const sanitizeName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return "Untitled playlist";
  return trimmed.slice(0, 60);
};

export async function GET(request: Request) {
  const user = await requireAuthenticatedUser(request);
  const q = query(playlistsCollection, where("ownerUid", "==", user.uid));
  const snapshot = await getDocs(q);
  const playlists = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: (data.name as string) || "Untitled playlist",
      songIds: Array.isArray(data.songIds) ? data.songIds : [],
    };
  });
  return NextResponse.json({ playlists });
}

export async function POST(request: Request) {
  const user = await requireAuthenticatedUser(request);
  const body = await request.json();
  const playlistName = sanitizeName(body?.name || "");
  await addDoc(playlistsCollection, {
    ownerUid: user.uid,
    name: playlistName,
    songIds: [],
  });
  return NextResponse.json({ success: true });
}
