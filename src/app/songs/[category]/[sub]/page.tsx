// src/app/songs/[category]/[sub]/page.tsx (EN)
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, QueryConstraint } from "firebase/firestore";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";
import { primaryCategories } from "@/data/categories";
import clsx from "clsx";
import { createCombinedSortComparator } from "@/lib/sortingUtils";

export default function SongsBySubCategory() {
  const router = useRouter();
  const params = useParams() as { category: string; sub: string };
  const { category, sub } = params;
  const decodedSub = decodeURIComponent(sub);

  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);

  const [sortByBeat, setSortByBeat] = useState(false);
  const [sortByKey, setSortByKey] = useState(false);

  const handleSongDelete = (deletedSongId: string) => {
    setSongs((prevSongs) => prevSongs.filter((song) => song.id !== deletedSongId));
  };

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const songsCollectionRef = collection(db, "songs");
      const currentCategory = primaryCategories.find((c) => c.key.toLowerCase() === category.toLowerCase());
      const fieldName = currentCategory?.key || category;
      const isArrayField = ["Genre", "Event", "Season"].includes(fieldName);

      const constraints: QueryConstraint[] = [];
      if (isArrayField) constraints.push(where(fieldName, "array-contains", decodedSub));
      else constraints.push(where(fieldName, "==", decodedSub));

      const q = query(songsCollectionRef, ...constraints);
      const songSnapshot = await getDocs(q);
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

      setSongs(fetchedSongs);
    } catch (error) {
      console.error("Error fetching filtered songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [category, sub]);

  const filteredAndSortedSongs = useMemo(() => {
    let resultSongs = songs;
    const q = queryText.toLowerCase().trim();

    if (queryText) {
      resultSongs = resultSongs.filter(
        (s) => s.title.toLowerCase().includes(q) || s.Key.toLowerCase().includes(q)
      );
    }

    resultSongs = [...resultSongs];
    const comparator = createCombinedSortComparator(sortByBeat, sortByKey);
    if (sortByBeat || sortByKey) {
      resultSongs.sort(comparator);
    } else {
      resultSongs.sort((a, b) => a.title.localeCompare(b.title, "he"));
    }

    return resultSongs;
  }, [songs, queryText, sortByBeat, sortByKey]);

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-4 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => router.back()} className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm px-3 py-1 shadow-sm transition">
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-50 truncate">{decodedSub}</h1>
      </div>

      <div className="sticky top-14 z-10 bg-gray-900 pt-2 pb-4">
        <input
          type="text"
          placeholder="Filter by title or key..."
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
            sortByBeat ? "bg-teal-500 text-gray-900" : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          Sort by Beat first
        </button>
        <button
          onClick={() => setSortByKey(!sortByKey)}
          className={clsx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
            sortByKey ? "bg-teal-500 text-gray-900" : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          Sort by Key first
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        {sortByBeat && sortByKey && "Sort order: Beat > Key > A–Z"}
        {sortByBeat && !sortByKey && "Sort order: Beat > A–Z"}
        {!sortByBeat && sortByKey && "Sort order: Key > A–Z"}
        {!sortByBeat && !sortByKey && "Sort order: A–Z"}
      </p>

      {loading ? (
        <p className="text-center text-teal-400 py-10">Loading songs...</p>
      ) : (
        <div className="grid gap-3 pb-24">
          {filteredAndSortedSongs.length > 0 ? (
            filteredAndSortedSongs.map((song) => (
              <SongCard key={song.id} song={song} onDeleteSuccess={handleSongDelete} />
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">No songs found for "{decodedSub}"</p>
          )}
        </div>
      )}
    </div>
  );
}
