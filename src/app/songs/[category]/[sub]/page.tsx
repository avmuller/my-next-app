// src/app/songs/[category]/[sub]/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";
import { primaryCategories } from "@/data/categories"; // ייבוא הקטגוריות הראשיות

export default function SongsBySubCategory() {
  const router = useRouter();
  const params = useParams() as { category: string; sub: string };
  const { category, sub } = params;
  const decodedSub = decodeURIComponent(sub);

  const [queryText, setQueryText] = useState("");
  // **שינוי:** המיון לפי "key" משתמש בשם השדה המעודכן "Key"
  const [sort, setSort] = useState<"title" | "Key">("title");
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);

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

  // פונקציה אסינכרונית לטעינת נתונים מ-Firebase
  const fetchSongs = async () => {
    setLoading(true);
    try {
      const songsCollectionRef = collection(db, "songs");

      // **שינוי קריטי:** מציאת שם השדה האמיתי (כגון 'Genre' או 'Key')
      const currentCategory = primaryCategories.find(
        (c) => c.key.toLowerCase() === category.toLowerCase()
      );
      const fieldName = currentCategory?.key || category;

      const isArrayField = ["Genre", "Style", "Event"].includes(fieldName);

      // **הגבלת הקריאה ב-Firestore:**
      const constraints: QueryConstraint[] = [];

      if (isArrayField) {
        // עבור שדות שהם מערכים (Genre, Style, Event)
        constraints.push(where(fieldName, "array-contains", decodedSub));
      } else {
        // עבור שדות שהם מחרוזות יחידות (Singer, Key, Beat, Album וכו')
        constraints.push(where(fieldName, "==", decodedSub));
      }

      const q = query(songsCollectionRef, ...constraints);
      const songSnapshot = await getDocs(q);

      const fetchedSongs: Song[] = songSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Fetched song data:", data);
        return {
          id: doc.id,
          ...data,
          // **עדכון: מיפוי נכון של שדות המערך לפי הכתיב המעודכן (Genre, Style, Event)**
          Genre: data.Genre || [],
          Event: data.Event || [],
        } as Song;
      });

      setSongs(fetchedSongs);
    } catch (error) {
      console.error("Error fetching filtered songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // טעינת הנתונים בפעם הראשונה
  useEffect(() => {
    fetchSongs();
  }, [category, sub]);

  const filteredAndSortedSongs = useMemo(() => {
    let resultSongs = songs;

    // 1. סינון לפי שאילתת טקסט (חיפוש)
    if (queryText) {
      const q = queryText.toLowerCase();
      resultSongs = resultSongs.filter(
        // **שינוי:** חיפוש לפי שדה title ו-Key
        (s) =>
          s.title.toLowerCase().includes(q) || s.Key.toLowerCase().includes(q)
      );
    }

    // 2. מיון
    if (sort === "title") {
      resultSongs = [...resultSongs].sort((a, b) =>
        a.title.localeCompare(b.title, "he")
      );
    } else if (sort === "Key") {
      // **שינוי:** מיון לפי "Key"
      resultSongs = [...resultSongs].sort((a, b) => {
        // **שינוי:** שימוש בשדה Key
        const cleanA = a.Key.replace("m", "");
        const cleanB = b.Key.replace("m", "");
        const indexA = musicalOrder.indexOf(cleanA);
        const indexB = musicalOrder.indexOf(cleanB);

        // **שינוי:** שימוש בשדה Key
        if (indexA === -1 || indexB === -1) return a.Key.localeCompare(b.Key);
        return indexA - indexB;
      });
    }

    return resultSongs;
  }, [songs, queryText, sort]); // תלויות: השירים שנטענו, טקסט החיפוש, ובחירת המיון

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 shadow-sm transition"
        >
          ⬅️ חזרה
        </button>
        <h1 className="text-xl font-semibold text-gray-800 truncate">
          {decodedSub}
        </h1>
      </div>

      {/* Search box */}
      <div className="sticky top-0 bg-white z-10 p-2 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="חפש לפי שם או סולם..."
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSort("title")}
          className={`flex-1 min-w-[120px] rounded-lg px-3 py-2 text-sm font-medium transition
            ${
              sort === "title"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          מיין לפי שם
        </button>
        <button
          onClick={() => setSort("Key")} // **שינוי:** מיון לפי "Key"
          className={`flex-1 min-w-[120px] rounded-lg px-3 py-2 text-sm font-medium transition
            ${
              sort === "Key"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          מיין לפי סולם
        </button>
      </div>

      {/* Loading/Error/Content */}
      {loading ? (
        <p className="text-center text-blue-600 py-10">טוען שירים...</p>
      ) : (
        <div className="grid gap-3 pb-24">
          {filteredAndSortedSongs.length > 0 ? (
            filteredAndSortedSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-10">
              לא נמצאו שירים התואמים ל"{decodedSub}" 🎵
            </p>
          )}
        </div>
      )}
    </div>
  );
}
