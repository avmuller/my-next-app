// src/app/search/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";

// שדות שאנו רוצים לחפש בהם
const SEARCHABLE_FIELDS: (keyof Song)[] = [
  "title",
  "Composer",
  "Key",
  "Beat",
  "Theme",
  "Singer",
  // שדות מערך נחפש במיפוי
  "Genre",
  "Event",
];

export default function SearchPage() {
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [sort, setSort] = useState<"title" | "Key">("title");

  // רשימת הסולמות למיון
  const musicalOrder = [
    "C",
    "C#",
    "Db",
    "D",
    "D#",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "G#",
    "Ab",
    "A",
    "A#",
    "Bb",
    "B",
  ];

  // טוען את כל השירים פעם אחת
  useEffect(() => {
    const fetchAllSongs = async () => {
      setLoading(true);
      try {
        const songsCollectionRef = collection(db, "songs");
        // **הערה:** חיפוש חופשי (Fuzzy Search) לא נתמך ישירות ב-Firestore,
        // לכן אנחנו מביאים את כל הנתונים ומסננים בצד הלקוח.
        const songSnapshot = await getDocs(songsCollectionRef);

        const fetchedSongs: Song[] = songSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            Genre: data.Genre || [],
            Event: data.Event || [],
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

    // 1. סינון לפי שאילתת טקסט (חיפוש חופשי)
    if (q.length > 1) {
      // חיפוש רק אחרי 2 תווים ומעלה
      resultSongs = resultSongs.filter((song) => {
        // בודק אם השאילתה קיימת באחד מהשדות הניתנים לחיפוש
        return SEARCHABLE_FIELDS.some((field) => {
          const value = (song as any)[field];
          if (Array.isArray(value)) {
            // עבור מערכים (Genre, Style), בודק אם אחד האיברים מכיל את השאילתה
            return value.some((item) => item.toLowerCase().includes(q));
          }
          // עבור מחרוזות יחידות (Title, Artist, Key וכו')
          return String(value || "")
            .toLowerCase()
            .includes(q);
        });
      });
    }

    // 2. מיון (אותה לוגיקה כמו בדף תת-הקטגוריות)
    if (sort === "title") {
      resultSongs = [...resultSongs].sort((a, b) =>
        a.title.localeCompare(b.title, "he")
      );
    } else if (sort === "Key") {
      resultSongs = [...resultSongs].sort((a, b) => {
        const cleanA = a.Key.replace("m", "");
        const cleanB = b.Key.replace("m", "");
        const indexA = musicalOrder.indexOf(cleanA);
        const indexB = musicalOrder.indexOf(cleanB);
        if (indexA === -1 || indexB === -1) return a.Key.localeCompare(b.Key);
        return indexA - indexB;
      });
    }

    return resultSongs;
  }, [allSongs, queryText, sort]);

  return (
    <div className="min-h-screen space-y-5 p-4">
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

      {/* כפתורי מיון */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSort("title")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
            sort === "title"
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          }`}
        >
          מיין לפי שם
        </button>
        <button
          onClick={() => setSort("Key")}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
            sort === "Key"
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          }`}
        >
          מיין לפי סולם
        </button>
      </div>

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
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
}
