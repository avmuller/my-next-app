// src/app/admin/actions.ts
// This file contains all Server Actions (CRUD operations) for the Admin interface.
// It is protected by Next.js Server environment and should contain security checks.
"use server";

import { db } from "@/lib/firebase";
import { requireAdminUser } from "@/lib/auth/server";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  // We don't use 'db' from firebase.ts directly in Client components, but here it's safe.
} from "firebase/firestore";
import { Song, SongForm } from "@/types/song";
import {
  splitAndClean,
  FIELDS_FOR_UNIQUE_FETCH,
  initialSongState,
} from "@/lib/admin-config";

// Interface for normalized form data returned from server to client
interface FormReadySong extends SongForm {
  id: string;
}

// Utility to fetch unique categories and all songs (Server Read operation)
// Used to supply initial data to client components.
export const getAdminInitialData = async () => {
  await requireAdminUser();
  const songsCollection = collection(db, "songs");
  const songSnapshot = await getDocs(songsCollection);
  const allData: Song[] = songSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Song)
  );

  // Logic to build unique categories for autocomplete
  const uniqueData: Record<
    string,
    Set<string>
  > = FIELDS_FOR_UNIQUE_FETCH.reduce((acc, field) => {
    acc[field as string] = new Set();
    return acc;
  }, {} as Record<string, Set<string>>);

  allData.forEach((song) => {
    FIELDS_FOR_UNIQUE_FETCH.forEach((field) => {
      const value = song[field as keyof Song];
      if (Array.isArray(value)) {
        value.forEach((item) => item && uniqueData[field as string].add(item));
      } else if (typeof value === "string" && value.trim().length > 0) {
        uniqueData[field as string].add(value);
      }
    });
  });

  const uniqueCategories: Record<string, string[]> = {};
  Object.keys(uniqueData).forEach((key) => {
    uniqueCategories[key] = Array.from(uniqueData[key]).sort((a, b) =>
      a.localeCompare(b, "en")
    );
  });

  return { uniqueCategories, allSongs: allData };
};

// Action to fetch a single song for editing (Server Read)
export const fetchSongForEditAction = async (
  id: string
): Promise<FormReadySong | null> => {
  try {
    await requireAdminUser();
  } catch {
    return null;
  }

  const docRef = doc(db, "songs", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Normalize array fields back to comma-separated strings for the form UI
    const formReadyData: FormReadySong = {
      id: id,
      title: data.title || initialSongState.title,
      Beat: data.Beat || initialSongState.Beat,
      Key: data.Key || initialSongState.Key,
      Theme: data.Theme || initialSongState.Theme,
      Composer: data.Composer || initialSongState.Composer,
      Singer: data.Singer || initialSongState.Singer,
      hasidut: data.hasidut || initialSongState.hasidut,
      Lyrics: data.Lyrics || initialSongState.Lyrics,
      // Convert arrays back to comma-separated strings for form fields
      Season: Array.isArray(data.Season)
        ? data.Season.join(", ")
        : data.Season || "",
      Genre: Array.isArray(data.Genre)
        ? data.Genre.join(", ")
        : data.Genre || "",
      Event: Array.isArray(data.Event)
        ? data.Event.join(", ")
        : data.Event || "",
    } as unknown as FormReadySong;

    return formReadyData;
  }
  return null;
};

// Action to add or update a song (Server Mutation)
// NOTE: SongForm receives string fields for array data (Season, Genre, Event)
export const saveSongAction = async (
  songData: SongForm,
  editingId: string | null
) => {
  await requireAdminUser();

  // Re-process string fields to arrays using splitAndClean utility
  const processedSongData = {
    title: songData.title.trim(),
    Beat: songData.Beat.trim(),
    Key: songData.Key.trim(),
    Theme: songData.Theme,
    Composer: songData.Composer,
    Singer: songData.Singer,
    hasidut: songData.hasidut,
    Lyrics: songData.Lyrics,
    Season: splitAndClean(songData.Season as unknown as string),
    Genre: splitAndClean(songData.Genre as unknown as string),
    Event: splitAndClean(songData.Event as unknown as string),
  };

  if (editingId) {
    const songRef = doc(db, "songs", editingId);
    await updateDoc(songRef, processedSongData);
    return { success: true, message: "✔️ Song updated successfully!" };
  } else {
    await addDoc(collection(db, "songs"), processedSongData);
    return { success: true, message: "➕ Song added successfully!" };
  }
};

// Action to import songs from parsed Excel data (Server Mutation)
type ExcelRow = Record<string, string | string[] | undefined>;

export const importExcelAction = async (excelData: ExcelRow[]) => {
  await requireAdminUser();

  let successfulImports = 0;
  const songsCollection = collection(db, "songs");

  for (const row of excelData) {
    try {
      const getValue = (key: string) =>
        row[key] && typeof row[key] === "string" ? (row[key] as string) : "";

      // NOTE: Excel data normalization must happen on the client before calling this action,
      // but the cleaning (splitAndClean) is performed here for final verification.
      const songData: Omit<Song, "id"> = {
        title: getValue("Song") || getValue("title"),
        Beat: getValue("Beat"),
        Key: getValue("Key"),
        Theme: getValue("Theme"),
        Composer: getValue("Composer"),
        Singer: getValue("Singer"),
        Season: splitAndClean(row["Season"] ?? ""),
        hasidut: getValue("hasidut"),
        Lyrics: getValue("Lyrics"),
        Genre: splitAndClean(row["Genre"] ?? ""),
        Event: splitAndClean(row["Event"] ?? ""),
      };

      await addDoc(songsCollection, songData);
      successfulImports++;
    } catch (e) {
      console.error("Error importing song row:", row, e);
    }
  }

  return {
    success: true,
    message: `Import complete! ${successfulImports} songs imported successfully.`,
  };
};

// Action to delete a song (Server Mutation)
export const deleteSongAction = async (songId: string) => {
  await requireAdminUser();

  await deleteDoc(doc(db, "songs", songId));
  return { success: true, message: "Song deleted." };
};
