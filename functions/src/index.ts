import {setGlobalOptions} from "firebase-functions/v2/options";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";

setGlobalOptions({region: "us-central1", maxInstances: 10});

initializeApp();
const firestore = getFirestore();
type SongDoc = Record<string, unknown>;

const CATEGORY_KEYS = [
  "Event",
  "Season",
  "Theme",
  "Singer",
  "Composer",
  "Genre",
  "hasidut",
] as const;

const ARRAY_FIELDS = new Set(["Event", "Season", "Genre"]);

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const removeValueIfUnused = async (field: string, value: string) => {
  const songsRef = firestore.collection("songs");
  const query = ARRAY_FIELDS.has(field)
    ? songsRef.where(field, "array-contains", value).limit(1)
    : songsRef.where(field, "==", value).limit(1);
  const snapshot = await query.get();

  if (!snapshot.empty) return;

  const metadataRef = firestore.collection("categories_metadata").doc(field);
  await metadataRef.set(
    {values: FieldValue.arrayRemove(value)},
    {merge: true},
  );
};

export const syncCategoriesMetadata = onDocumentWritten(
  "songs/{songId}",
  async (event) => {
    const songData = event.data?.after?.data() as SongDoc | undefined;
    const previousSongData = event.data?.before?.data() as SongDoc | undefined;

    if (!songData && !previousSongData) return;

    const tasks: Promise<unknown>[] = [];

    CATEGORY_KEYS.forEach((field) => {
      const beforeValues = toStringArray(previousSongData?.[field]);
      const afterValues = toStringArray(songData?.[field]);

      const beforeSet = new Set(beforeValues);
      const afterSet = new Set(afterValues);

      const added = afterValues.filter((value) => !beforeSet.has(value));
      const removed = beforeValues.filter((value) => !afterSet.has(value));

      if (added.length) {
        const metadataRef = firestore.collection("categories_metadata").doc(field);
        tasks.push(
          metadataRef.set(
            {values: FieldValue.arrayUnion(...added)},
            {merge: true},
          ),
        );
      }

      removed.forEach((value) => {
        tasks.push(removeValueIfUnused(field, value));
      });
    });

    await Promise.all(tasks);
    logger.info("categories_metadata synced", {songId: event.params.songId});
  },
);
