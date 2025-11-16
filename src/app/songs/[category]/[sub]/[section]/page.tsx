// src/app/songs/[category]/[sub]/[section]/page.tsx
// Purpose: Display the Meal/Dance (or any extra) section under a specific sub-category.
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
import { primaryCategories } from "@/data/categories";
import clsx from "clsx";
import { createCombinedSortComparator } from "@/lib/sortingUtils";

const weddingLabels = ["wedding", "חתונה", "chatuna", "chasuna", "chassuna"];
const danceBeatTriggers = ["frailach", "freilach", "hora"];

export default function WeddingSectionSongsPage() {
  const router = useRouter();
  const params = useParams() as {
    category: string;
    sub: string;
    section: string;
  };
  const { category, sub, section } = params;

  const decodedSub = decodeURIComponent(sub);
  const decodedSection = decodeURIComponent(section);
  const normalizedSub = decodedSub.trim().toLowerCase();
  const normalizedSection = decodedSection.trim().toLowerCase();
  const isWeddingCategory = weddingLabels.some((label) =>
    normalizedSub.includes(label)
  );
  const isDanceSection = normalizedSection === "dance";
  const isMealSection = normalizedSection === "meal";

  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const [sortByBeat, setSortByBeat] = useState(false);
  const [sortByKey, setSortByKey] = useState(false);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const songsCollectionRef = collection(db, "songs");
      const currentCategory = primaryCategories.find(
        (c) => c.key.toLowerCase() === category.toLowerCase()
      );
      const fieldName = currentCategory?.key || category;
      const isArrayField = ["Genre", "Event", "Season"].includes(fieldName);

      const constraints: QueryConstraint[] = [];
      if (isArrayField)
        constraints.push(where(fieldName, "array-contains", decodedSub));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sub]);

  const filteredAndSortedSongs = useMemo(() => {
    let resultSongs = songs;
    const q = queryText.toLowerCase().trim();

    if (queryText) {
      resultSongs = resultSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) || s.Key.toLowerCase().includes(q)
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

  const sectionFilteredSongs = useMemo(() => {
    if (!isWeddingCategory || (!isDanceSection && !isMealSection)) {
      return filteredAndSortedSongs;
    }

    return filteredAndSortedSongs.filter((song) => {
      const beatValue = (song.Beat || "").toString().toLowerCase();
      const isDanceSong = danceBeatTriggers.some((beat) =>
        beatValue.includes(beat)
      );
      return isDanceSection ? isDanceSong : !isDanceSong;
    });
  }, [
    filteredAndSortedSongs,
    isWeddingCategory,
    isDanceSection,
    isMealSection,
  ]);

  const sectionTitle = isDanceSection
    ? "Dance"
    : isMealSection
    ? "Meal"
    : decodedSection;

  const helperText = isDanceSection
    ? "Showing all Frailach/Hora beats."
    : isMealSection
    ? "Showing all other beats for the meal."
    : `Songs tagged as ${decodedSection}.`;

  return (
    <div className="min-h-screen bg-gray-900 px-2 py-4 sm:px-3 space-y-5">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm px-3 py-1 shadow-sm transition"
        >
          Back
        </button>
        <h1 className="text-lg font-semibold text-gray-50 truncate">
          {decodedSub} · {sectionTitle}
        </h1>
      </div>
      <p className="text-sm text-gray-400">{helperText}</p>

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
            sortByBeat
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          Sort by Beat first
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
          {sectionFilteredSongs.length > 0 ? (
            sectionFilteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">
              No songs found for "{decodedSection}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
