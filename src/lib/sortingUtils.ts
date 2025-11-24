// src/lib/sortingUtils.ts
// Purpose: Sorting helpers for Song lists shared across pages.
// Provides a combined comparator for Beat/Key with title fallback.
import { Song } from "@/types/song";
import { isRhythmChanges, splitBeatValue } from "@/lib/beatUtils";

const RHYTHM_CHANGES_TAG = "Rhythm Changes";

// Helper 1: compute a sortable beat value (Rhythm Changes variants sink to the end)
export const getBeatSortValue = (beat: string | string[]) => {
  if (isRhythmChanges(beat)) {
    return "ZZZZ" + RHYTHM_CHANGES_TAG;
  }
  const first = splitBeatValue(beat)[0] || "";
  return first;
};

/**
 * Combined comparator with optional Beat/Key weighting, falling back to title.
 * @param sortByBeat - whether Beat is the primary sort key.
 * @param sortByKey - whether Key is a secondary sort key.
 */
export const createCombinedSortComparator = (
  sortByBeat: boolean,
  sortByKey: boolean
) => {
  return (a: Song, b: Song): number => {
    // --- Level 1: Beat (Primary if selected) ---
    if (sortByBeat) {
      const beatA = getBeatSortValue(a.Beat);
      const beatB = getBeatSortValue(b.Beat);

      if (beatA !== beatB) {
        return beatA.localeCompare(beatB, "en");
      }
    }

    // --- Level 2: Key (Secondary if selected) ---
    if (sortByKey) {
      const keyA = a.Key || "";
      const keyB = b.Key || "";

      if (keyA !== keyB) {
        return keyA.localeCompare(keyB, "en");
      }
    }

    // --- Level 3: Default (Title)
    return a.title.localeCompare(b.title, "he");
  };
};
