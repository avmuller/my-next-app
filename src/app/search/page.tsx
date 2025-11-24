// src/app/search/page.tsx (EN)
// Purpose: Full-text-ish client-side search across songs with
// optional sorting by Beat and Key.
"use client";

import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";
import clsx from "clsx";
import { createCombinedSortComparator } from "@/lib/sortingUtils";
import { splitBeatValue } from "@/lib/beatUtils";
import { splitAndClean } from "@/lib/admin-config";

// Song fields included in the search sweep
const SEARCHABLE_FIELDS: (keyof Song)[] = [
  "title",
  "Composer",
  "Key",
  "Beat",
  "Theme",
  "Singer",
  "Genre",
  "Event",
];

export default function SearchPage() {
  // UI state: query text, loading indicator, and fetched songs
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);

  // Sorting toggles for Beat and Key
  const [sortByBeat, setSortByBeat] = useState(false);
  const [sortByKey, setSortByKey] = useState(false);

  // Fetch the entire songs collection once into memory
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
            Beat: splitBeatValue(data.Beat),
            Genre: splitAndClean(data.Genre),
            Event: splitAndClean(data.Event),
            Season: splitAndClean(data.Season),
            Theme: splitAndClean(data.Theme),
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

  // Derive filtered + sorted list when inputs change
  const filteredAndSortedSongs = useMemo(() => {
    let resultSongs = allSongs;
    const q = queryText.toLowerCase().trim();

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

    resultSongs = [...resultSongs];
    const comparator = createCombinedSortComparator(sortByBeat, sortByKey);
    // Use the shared comparator when any sort option is toggled
    if (sortByBeat || sortByKey) {
      resultSongs.sort(comparator);
    } else {
      resultSongs.sort((a, b) => a.title.localeCompare(b.title, "he"));
    }

    return resultSongs;
  }, [allSongs, queryText, sortByBeat, sortByKey]);

  // Render search UI, controls, and results
  return (
    <div className="min-h-screen space-y-4 px-3 py-4 sm:px-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-gray-50">Search Songs</h1>

      <div className="sticky top-4 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800 pb-3">
        <input
          type="text"
          placeholder="Search title, composer, key, beat..."
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-gray-50 focus:ring-teal-500 focus:border-teal-500 outline-none shadow-lg text-lg"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        />
      </div>

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
          Sort by Beat
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
          Sort by Key
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        {sortByBeat && sortByKey && "Sort order: Beat > Key > A–Z"}
        {sortByBeat && !sortByKey && "Sort order: Beat > A–Z"}
        {!sortByBeat && sortByKey && "Sort order: Key > A–Z"}
        {!sortByBeat && !sortByKey && "Sort order: A–Z"}
      </p>

      {loading && !allSongs.length && (
        <p className="text-center text-teal-400 py-10">Loading songs...</p>
      )}

      {!loading && queryText.length < 2 && allSongs.length > 0 && (
        <p className="text-center text-gray-400 py-10">
          Type at least 2 characters to search.
        </p>
      )}

      {!loading &&
        queryText.length >= 2 &&
        filteredAndSortedSongs.length === 0 && (
          <p className="text-center text-gray-400 py-10">No results found.</p>
        )}

      <div className="grid gap-4 pb-4">
        {filteredAndSortedSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
          />
        ))}
      </div>
    </div>
  );
}
