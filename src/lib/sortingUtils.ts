// src/lib/sortingUtils.ts
import { Song } from "@/types/song";

const RHYTHM_CHANGES_TAG = "Rhythm Changes";

// Helper 1: מחזירה ערך מיון עבור Beat (ממקמת Rhythm Changes בסוף)
export const getBeatSortValue = (beat: string) => {
  if (beat && typeof beat === "string" && beat.includes(",")) {
    // הערך הגבוה ביותר אלפביתית כדי למקם אחרון
    return "ZZZZ" + RHYTHM_CHANGES_TAG;
  }
  return beat || "";
};

/**
 * פונקציית מיון המשלבת לוגיקה היררכית: (Beat > Key > Title).
 * @param sortByBeat - האם למיין לפי Beat ברמה הראשונה.
 * @param sortByKey - האם למיין לפי Key ברמה השנייה.
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

      // מיון אלפביתי רגיל (A-B-C)
      if (keyA !== keyB) {
        return keyA.localeCompare(keyB, "en");
      }
    }

    // --- Level 3: Default (Title א–ב) ---
    return a.title.localeCompare(b.title, "he");
  };
};
