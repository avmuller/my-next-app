// src/lib/beatUtils.ts
// Helpers for parsing, labeling, and sorting Beat values with special handling
// for "Rhythm Changes" variants that may contain commas but should stay together.

const RHYTHM_PREFIXES = ["rhythm changes", "rythem changes"];

export const splitBeatValue = (
  value: string | string[] | null | undefined
): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => v.length > 0);
  }

  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  const lower = trimmed.toLowerCase();

  // If the beat starts with a Rhythm Changes marker, keep the full string intact
  if (RHYTHM_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return [trimmed];
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const isRhythmChanges = (value: string | string[] | null | undefined) => {
  const first = splitBeatValue(value)[0] || "";
  const lower = first.toLowerCase();
  return (
    RHYTHM_PREFIXES.some((prefix) => lower.startsWith(prefix)) ||
    first.includes(",")
  );
};

export const beatLabel = (value: string | string[] | null | undefined) => {
  const beats = splitBeatValue(value);
  if (beats.length === 0) return "Other";
  const first = beats[0];
  if (isRhythmChanges(first)) return "Rhythm Changes";
  return first;
};

export const beatDisplayText = (
  value: string | string[] | null | undefined
) => {
  const beats = splitBeatValue(value);
  return beats.join(", ");
};
