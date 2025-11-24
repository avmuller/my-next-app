"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  QueryConstraint,
} from "firebase/firestore";
import clsx from "clsx";
import {
  CakeIcon,
  MusicalNoteIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { Song } from "@/types/song";
import SongCard from "@/components/SongCard";
import CategoryGrid from "@/components/CategoryGrid";
import { primaryCategories } from "@/data/categories";
import { beatLabel, splitBeatValue } from "@/lib/beatUtils";
import { splitAndClean } from "@/lib/admin-config";
import type { Category } from "@/data/categories";

const weddingLabels = ["wedding", "chatuna", "chasuna", "chassuna", "hatuna"];
const weddingSubCategories: Category[] = [
  { key: "Meal", label: "Meal", icon: CakeIcon },
  { key: "Dance", label: "Dance", icon: MusicalNoteIcon },
  { key: "Kabolath Ponim", label: "Kabolath Ponim", icon: SparklesIcon },
];

export default function SongsBySubCategory() {
  const router = useRouter();
  const params = useParams() as { category: string; sub: string };
  const { category, sub } = params;

  const decodedSub = decodeURIComponent(sub);
  const normalizedSub = decodedSub.trim().toLowerCase();
  const isWeddingCategory = weddingLabels.some((label) =>
    normalizedSub.includes(label)
  );

  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
  const getBeatLabelsForSong = (beatValue: Song["Beat"]) => {
    const beats = splitBeatValue(beatValue);
    if (beats.length === 0) return ["Other"];
    return beats.map((beat) => beatLabel(beat));
  };

  const [selectedBeat, setSelectedBeat] = useState<string>("ALL");
  const [sortMode, setSortMode] = useState<"alpha" | "key">("alpha");

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const songsCollectionRef = collection(db, "songs");
      const currentCategory = primaryCategories.find(
        (c) => c.key.toLowerCase() === category.toLowerCase()
      );
      const fieldName = currentCategory?.key || category;
      const isArrayField = ["Genre", "Event", "Season", "Beat", "Theme"].includes(
        fieldName
      );

      const constraints: QueryConstraint[] = [];
      if (isArrayField) {
        constraints.push(where(fieldName, "array-contains", decodedSub));
      } else {
        constraints.push(where(fieldName, "==", decodedSub));
      }

      const q = query(songsCollectionRef, ...constraints);
      const songSnapshot = await getDocs(q);
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

      setSongs(fetchedSongs);
    } catch (error) {
      console.error("Error fetching filtered songs:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWeddingCategory) {
      setSongs([]);
      setLoading(false);
      return;
    }
    fetchSongs();
    setSelectedBeat("ALL");
    setSortMode("alpha");
  }, [category, sub, isWeddingCategory]);

  const { availableBeats, filteredSongs } = useMemo(() => {
    let baseSongs = songs;
    const q = queryText.toLowerCase().trim();

    if (q) {
      baseSongs = baseSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(q) ||
          (song.Key || "").toLowerCase().includes(q)
      );
    }

    const beats = new Set<string>();
    baseSongs.forEach((song) => {
      getBeatLabelsForSong(song.Beat).forEach((label) => beats.add(label));
    });

    let beatFiltered = baseSongs;
    if (selectedBeat !== "ALL") {
      beatFiltered = beatFiltered.filter((song) => {
        const labels = getBeatLabelsForSong(song.Beat);
        return labels.includes(selectedBeat);
      });
    }

    const sortedSongs = [...beatFiltered];
    if (sortMode === "key") {
      sortedSongs.sort((a, b) => {
        const keyCompare = (a.Key || "").localeCompare(b.Key || "", "en");
        if (keyCompare !== 0) return keyCompare;
        return a.title.localeCompare(b.title, "he");
      });
    } else {
      sortedSongs.sort((a, b) => a.title.localeCompare(b.title, "he"));
    }

    const beatList = Array.from(beats).sort((a, b) =>
      a.localeCompare(b, "en")
    );

    return { availableBeats: beatList, filteredSongs: sortedSongs };
  }, [songs, queryText, selectedBeat, sortMode]);

  if (isWeddingCategory) {
    const weddingBasePath = `/songs/${encodeURIComponent(
      category
    )}/${encodeURIComponent(sub)}`;
    return (
      <div className="min-h-screen bg-gray-900 px-2 py-4 sm:px-3 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm px-3 py-1 shadow-sm transition"
          >
            Back
          </button>
          <h1 className="text-xl font-semibold text-gray-50 truncate">
            {decodedSub}
          </h1>
        </div>
        <p className="text-gray-300">Choose a section for this event:</p>
        <CategoryGrid categories={weddingSubCategories} basePath={weddingBasePath} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-2 py-4 sm:px-3 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm px-3 py-1 shadow-sm transition"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-50 truncate">
          {decodedSub}
        </h1>
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

      {availableBeats.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Filter by beat</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedBeat("ALL")}
              className={clsx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition shadow-sm",
                selectedBeat === "ALL"
                  ? "bg-teal-500 text-gray-900"
                  : "bg-gray-700 text-gray-50 hover:bg-gray-600"
              )}
            >
              All beats
            </button>
            {availableBeats.map((beat) => (
              <button
                key={beat}
                onClick={() => setSelectedBeat(beat)}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition whitespace-nowrap shadow-sm",
                  selectedBeat === beat
                    ? "bg-teal-400 text-gray-900"
                    : "bg-gray-800 text-gray-100 hover:bg-gray-700"
                )}
              >
                {beat}
              </button>
            ))}
          </div>
          {availableBeats.length > 3 && (
            <p className="text-xs text-gray-500 text-right pr-1">
              ← Swipe horizontally to view more
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSortMode("alpha")}
          className={clsx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
            sortMode === "alpha"
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          Sort A-Z
        </button>
        <button
          onClick={() => setSortMode("key")}
          className={clsx(
            "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
            sortMode === "key"
              ? "bg-teal-500 text-gray-900"
              : "bg-gray-700 text-gray-50 hover:bg-gray-600"
          )}
        >
          Sort by key
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        {sortMode === "alpha"
          ? "Alphabetical order"
          : "Key order (alphabetical within each key)"}
      </p>

      {loading ? (
        <p className="text-center text-teal-400 py-10">Loading songs...</p>
      ) : (
        <div className="grid gap-3 pb-24">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">
              No songs found for "{decodedSub}"
            </p>
          )}
        </div>
      )}
    </div>
  );
}
