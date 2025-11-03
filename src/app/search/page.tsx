// src/app/search/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";
import clsx from "clsx";
// ייבוא לוגיקת המיון המאוחדת
import { createCombinedSortComparator } from "@/lib/sortingUtils";

// שדות שאנו רוצים לחפש בהם
const SEARCHABLE_FIELDS: (keyof Song)[] = [
  "title",
  "Composer",
  "Key",
  "Beat",
  "Theme",
  "Singer",
  "year",
  // שדות מערך נחפש במיפוי
  "Genre",
  "Event",
];

export default function SearchPage() {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);

  // **מצבי המיון (ON/OFF) - מאפשרים שליטה כפולה**
  const [sortByBeat, setSortByBeat] = useState(false);
  const [sortByKey, setSortByKey] = useState(false);

  // **הוספת Callback: עדכון המצב המקומי לאחר מחיקה מוצלחת**
  const handleSongDelete = (deletedSongId: string) => {
    setAllSongs((prevSongs) =>
      prevSongs.filter((song) => song.id !== deletedSongId)
    );
  };

  // טוען את כל השירים פעם אחת
  useEffect(() => {
    const fetchAllSongs = async () => {
      setLoading(true);
      try {
        const songsCollectionRef = collection(db, "songs");
        const songSnapshot = await getDocs(songsCollectionRef);

        const fetchedSongs: Song[] = songSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Genre: data.Genre || [],
            Event: data.Event || [],
            Season: data.Season || [],
          } as Song;
        });
        setAllSongs(fetchedSongs);
      } catch (error) {
        console.error("Error fetching all songs for search:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSongs();
  }, []);

  const filteredAndSortedSongs = useMemo(() => {
    let resultSongs = allSongs;
    const q = queryText.toLowerCase().trim();

    // 1. Filtering logic
    if (q.length > 1) {
      resultSongs = resultSongs.filter((song) => {
        return SEARCHABLE_FIELDS.some((field) => {
          const value = (song as any)[field];
          if (Array.isArray(value)) {
            return value.some((item) => String(item).toLowerCase().includes(q));
          }
          return String(value || "")
            .toLowerCase()
            .includes(q);
        });
      });
    }

    // 2. Sorting Logic (Multi-level Hierarchy)
    resultSongs = [...resultSongs];

    // **שימוש בפונקציית המיון המאוחדת:**
    const comparator = createCombinedSortComparator(sortByBeat, sortByKey);

    // הפעלת המיון רק אם אחד מהכפתורים נבחר
    if (sortByBeat || sortByKey) {
      resultSongs.sort(comparator);
    } else {
      // ברירת מחדל: תמיד מסודר לפי שם (א-ב)
      resultSongs.sort((a, b) => a.title.localeCompare(b.title, "he"));
    }

    return resultSongs;
  }, [allSongs, queryText, sortByBeat, sortByKey]);

  return (
    <div className="min-h-screen space-y-5 p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-50 mb-6">חיפוש שירים 🔎</h1>

      {/* שדה חיפוש ראשי */}
      <div className="sticky top-14 z-10 bg-gray-900 pt-2 pb-4">
        <input
          type="text"
          placeholder="הזן שם, אמן, סולם, מקצב..."
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-gray-50 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-lg text-lg"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

      {/* **כפתורי מיון ON/OFF** */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSortByBeat(!sortByBeat)}
          className={clsx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
            sortByBeat
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          מיין לפי מקצב 🥁
        </button>
        <button
          onClick={() => setSortByKey(!sortByKey)}
          className={clsx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
            sortByKey
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          מיין לפי סולם 🎹
        </button>
      </div>

      {/* הודעה על מיון נוכחי */}
      <p className="text-xs text-gray-400 text-center pt-2">
        {sortByBeat && sortByKey && "ממוין: מקצב > סולם > שם (משולב)"}
        {sortByBeat && !sortByKey && "ממוין: מקצב > שם"}
        {!sortByBeat && sortByKey && "ממוין: סולם > שם"}
        {!sortByBeat && !sortByKey && "ממוין: שם (א-ב)"}
      </p>

      {/* תוצאות חיפוש */}
      {loading && !allSongs.length && (
        <p className="text-center text-teal-400 py-10">
          טוען את ספריית השירים...
        </p>
      )}

      {!loading && queryText.length < 2 && allSongs.length > 0 && (
        <p className="text-center text-gray-400 py-10">
          הזן לפחות 2 תווים כדי להתחיל חיפוש.
        </p>
      )}

      {!loading &&
        queryText.length >= 2 &&
        filteredAndSortedSongs.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            לא נמצאו שירים תואמים 😔
          </p>
        )}

      <div className="grid gap-4 pb-4">
        {filteredAndSortedSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onDeleteSuccess={handleSongDelete}
          />
        ))}
      </div>
    </div>
  );
}
