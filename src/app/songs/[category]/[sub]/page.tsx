"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { demoSongs } from "@/data/demoSongs";
import SongCard from "@/components/SongCard";

export default function SongsBySubCategory() {
  const router = useRouter();
  const params = useParams() as { category: string; sub: string };
  const { category, sub } = params;
  const decodedSub = decodeURIComponent(sub);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"title" | "key">("title");

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

  const filtered = useMemo(() => {
    let songs = demoSongs.filter((song) => {
      if (category === "artists") return song.artist === decodedSub;
      if (category === "genres") return song.genres.includes(decodedSub);
      if (category === "styles") return song.styles.includes(decodedSub);
      if (category === "events") return song.events.includes(decodedSub);
      return false;
    });

    if (query) {
      const q = query.toLowerCase();
      songs = songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.key.toLowerCase().includes(q)
      );
    }

    if (sort === "title") {
      songs = [...songs].sort((a, b) => a.title.localeCompare(b.title, "he"));
    } else if (sort === "key") {
      songs = [...songs].sort((a, b) => {
        const cleanA = a.key.replace("m", "");
        const cleanB = b.key.replace("m", "");
        const indexA = musicalOrder.indexOf(cleanA);
        const indexB = musicalOrder.indexOf(cleanB);
        if (indexA === -1 || indexB === -1) return a.key.localeCompare(b.key);
        return indexA - indexB;
      });
    }

    return songs;
  }, [category, decodedSub, query, sort]);

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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
          onClick={() => setSort("key")}
          className={`flex-1 min-w-[120px] rounded-lg px-3 py-2 text-sm font-medium transition
            ${
              sort === "key"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          מיין לפי סולם
        </button>
      </div>

      {/* Songs grid */}
      <div className="grid gap-3 pb-24">
        {filtered.length > 0 ? (
          filtered.map((song) => <SongCard key={song.id} song={song} />)
        ) : (
          <p className="text-gray-500 text-center py-10">
            אין שירים זמינים בתת־קטגוריה זו 🎵
          </p>
        )}
      </div>
    </div>
  );
}
