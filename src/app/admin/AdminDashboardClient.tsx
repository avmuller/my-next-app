// src/app/admin/AdminDashboardClient.tsx
// Purpose: Client-side admin dashboard for song management UI interactions.
"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Song, SongForm } from "@/types/song";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminSongPayload } from "./types";

const SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE: (keyof Song)[] = [
  "Singer",
  "Composer",
  "Key",
  "Beat",
  "Theme",
  "hasidut",
];

const MULTI_VALUE_FIELDS: (keyof Song)[] = ["Genre", "Event", "Season"];
const FIELDS_FOR_UNIQUE_FETCH = [
  ...SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE,
  ...MULTI_VALUE_FIELDS,
];

const initialSongState: SongForm = {
  title: "",
  Beat: "",
  Key: "",
  Genre: [],
  Event: [],
  Theme: "",
  Composer: "",
  Singer: "",
  Season: [],
  hasidut: "",
  Lyrics: "",
};

const splitAndClean = (value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v) => v && v.trim() !== "");
  }

  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const buildPayloadFromForm = (form: SongForm): AdminSongPayload => ({
  title: form.title.trim(),
  Beat: form.Beat.trim(),
  Key: form.Key.trim(),
  Theme: form.Theme.trim(),
  Composer: form.Composer.trim(),
  Singer: form.Singer.trim(),
  hasidut: form.hasidut.trim(),
  Lyrics: form.Lyrics,
  Season: splitAndClean(form.Season as unknown as string),
  Genre: splitAndClean(form.Genre as unknown as string),
  Event: splitAndClean(form.Event as unknown as string),
});

const buildPayloadFromRow = (row: Record<string, any>): AdminSongPayload => ({
  title: (row["Song"] || row["title"] || "").toString(),
  Beat: (row["Beat"] || "").toString(),
  Key: (row["Key"] || "").toString(),
  Theme: (row["Theme"] || "").toString(),
  Composer: (row["Composer"] || "").toString(),
  Singer: (row["Singer"] || "").toString(),
  hasidut: (row["hasidut"] || "").toString(),
  Lyrics: (row["Lyrics"] || "").toString(),
  Season: splitAndClean(row["Season"] || ""),
  Genre: splitAndClean(row["Genre"] || ""),
  Event: splitAndClean(row["Event"] || ""),
});

const normalizeSongForForm = (song: Song): SongForm =>
  ({
    title: song.title,
    Beat: song.Beat,
    Key: song.Key,
    Theme: song.Theme,
    Composer: song.Composer,
    Singer: song.Singer,
    hasidut: song.hasidut,
    Lyrics: song.Lyrics,
    Season: song.Season.join(", "),
    Genre: song.Genre.join(", "),
    Event: song.Event.join(", "),
  } as unknown as SongForm);

const deriveUniqueCategories = (songs: Song[]): Record<string, string[]> => {
  const result: Record<string, Set<string>> = {};
  FIELDS_FOR_UNIQUE_FETCH.forEach((field) => {
    result[field] = new Set();
  });

  songs.forEach((song) => {
    FIELDS_FOR_UNIQUE_FETCH.forEach((field) => {
      const value = song[field];
      if (Array.isArray(value)) {
        value.forEach((item) => item && result[field].add(item));
      } else if (typeof value === "string" && value.trim().length > 0) {
        result[field].add(value);
      }
    });
  });

  const sorted: Record<string, string[]> = {};
  Object.entries(result).forEach(([key, set]) => {
    sorted[key] = Array.from(set).sort((a, b) => a.localeCompare(b, "en"));
  });
  return sorted;
};

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  const textColor = "text-white";

  return (
    <div
      dir="rtl"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-2xl ${bgColor} ${textColor} transition-all duration-300`}
      style={{ minWidth: "250px" }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className={`text-xl ${textColor} ml-4`}>
          &times;
        </button>
      </div>
    </div>
  );
};

interface AdminDashboardClientProps {
  initialUniqueCategories: Record<string, string[]>;
  initialSongs: Song[];
  addSongAction: (payload: AdminSongPayload) => Promise<void>;
  updateSongAction: (songId: string, payload: AdminSongPayload) => Promise<void>;
  deleteSongAction: (songId: string) => Promise<void>;
  importSongsAction: (payloads: AdminSongPayload[]) => Promise<void>;
}

export default function AdminDashboardClient({
  initialUniqueCategories,
  initialSongs,
  addSongAction,
  updateSongAction,
  deleteSongAction,
  importSongsAction,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdFromURL = searchParams.get("editId");

  const [song, setSong] = useState<SongForm>(initialSongState);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState(
    initialUniqueCategories
  );
  const [allSongs, setAllSongs] = useState<Song[]>(initialSongs);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [songSearchTerm, setSongSearchTerm] = useState("");
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [showSongManager, setShowSongManager] = useState(false);

  const updateSongsState = (updater: (prev: Song[]) => Song[]) => {
    setAllSongs((prev) => {
      const next = updater(prev);
      setUniqueCategories(deriveUniqueCategories(next));
      return next;
    });
  };

  const filteredSongs = useMemo(() => {
    const term = songSearchTerm.toLowerCase().trim();
    if (!term) return allSongs;
    return allSongs.filter((item) => {
      const haystacks = [
        item.title,
        item.Singer,
        item.Composer,
        item.Key,
        item.Beat,
        item.Theme,
      ]
        .filter(Boolean)
        .map((value) => value!.toString().toLowerCase());
      return haystacks.some((value) => value.includes(term));
    });
  }, [allSongs, songSearchTerm]);

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setUniqueCategories(initialUniqueCategories);
  }, [initialUniqueCategories]);

  useEffect(() => {
    setAllSongs(initialSongs);
  }, [initialSongs]);

  useEffect(() => {
    if (editIdFromURL) {
      const target = allSongs.find((entry) => entry.id === editIdFromURL);
      if (!target) {
        showToast("השיר לא נמצא לעריכה.", "error");
        router.replace("/admin");
        return;
      }
      setIsEditing(editIdFromURL);
      setSong(normalizeSongForForm(target));
    } else {
      setIsEditing(null);
      setSong(initialSongState);
    }
  }, [editIdFromURL, allSongs, router]);

  const handleManualChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayloadFromForm(song);

    try {
      if (isEditing) {
        await updateSongAction(isEditing, payload);
        updateSongsState((prev) =>
          prev.map((item) =>
            item.id === isEditing ? { ...item, ...payload } : item
          )
        );
        showToast("✔️ השיר עודכן בהצלחה!", "success");
        setIsEditing(null);
        router.replace("/admin");
      } else {
        await addSongAction(payload);
        showToast("➕ השיר נוסף בהצלחה!", "success");
      }

      setSong(initialSongState);
      router.refresh();
    } catch (error) {
      console.error("Error saving song:", error);
      showToast("❌ שמירת השיר נכשלה.", "error");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setSong(initialSongState);
    router.replace("/admin");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(json);
      showToast(`קובץ נטען (${json.length} שורות).`, "info");
    };
    reader.readAsBinaryString(file);
  };

  const handleImportExcel = async () => {
    if (excelData.length === 0) {
      showToast("אין נתונים לייבוא.", "info");
      return;
    }

    try {
      const payloads = excelData.map((row) => buildPayloadFromRow(row));
      await importSongsAction(payloads);
      showToast("✅ הייבוא הושלם!", "success");
      setExcelData([]);
      router.refresh();
    } catch (error) {
      console.error("Error importing songs:", error);
      showToast("❌ הייבוא נכשל.", "error");
    }
  };

  const handleDeleteSong = async (songId: string, title: string) => {
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingSongId(songId);
    try {
      await deleteSongAction(songId);
      updateSongsState((prev) => prev.filter((song) => song.id !== songId));
      showToast("Song deleted.", "success");
      router.refresh();
    } catch (error) {
      console.error("Error deleting song:", error);
      showToast("Failed to delete song.", "error");
    } finally {
      setDeletingSongId(null);
    }
  };

  const handleToggleSongManager = () => {
    setShowSongManager((prev) => !prev);
  };

  const formFields = Object.keys(initialSongState);
  const songsLoaded = allSongs.length > 0;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-50">
        פנל ניהול שירים 🎵
      </h1>

      <section className="mb-8 p-6 rounded-lg shadow-2xl bg-gray-900">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          {isEditing ? `עריכת שיר: ${song.title}` : "הוספת שיר יחיד"}
        </h2>

        <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
          {formFields.map((key) => {
            const isMultiValue = MULTI_VALUE_FIELDS.includes(key as keyof Song);
            const isAutocomplete =
              SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE.includes(key as keyof Song);
            const isRequired = key === "title" || key === "Singer";
            const value =
              isMultiValue && Array.isArray(song[key as keyof SongForm])
                ? (song[key as keyof SongForm] as string[]).join(", ")
                : (song[key as keyof SongForm] as string) || "";

            return (
              <div key={key} className="relative">
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-white"
                >
                  {key === "title"
                    ? "Title (Song)"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                  {isMultiValue && " (מופרד בפסיקים)"}
                </label>
                <input
                  type="text"
                  name={key}
                  id={key}
                  value={value}
                  onFocus={() => isAutocomplete && setOpenKey(key)}
                  onBlur={() =>
                    setTimeout(
                      () => setOpenKey((k) => (k === key ? null : k)),
                      100
                    )
                  }
                  onChange={(e) => {
                    handleManualChange(e);
                    if (isAutocomplete) {
                      const v = e.target.value ?? "";
                      setQueries((prev) => ({ ...prev, [key]: v }));
                      setOpenKey(key);
                    }
                  }}
                  required={isRequired}
                  autoComplete="off"
                  className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm p-2 bg-gray-800 text-gray-50 placeholder-gray-500"
                />

                {isAutocomplete && openKey === key && uniqueCategories[key] && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-700 bg-gray-800 text-gray-50 shadow-lg">
                    {(uniqueCategories[key] || [])
                      .filter((opt) =>
                        (queries[key] ?? "")
                          .toLowerCase()
                          .split(/\s+/)
                          .every((part) => opt.toLowerCase().includes(part))
                      )
                      .slice(0, 10)
                      .map((option) => (
                        <button
                          type="button"
                          key={option}
                          className="w-full text-right px-3 py-2 hover:bg-gray-700"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSong(
                              (prev) =>
                                ({
                                  ...prev,
                                  [key]: option,
                                } as SongForm)
                            );
                            setQueries((prev) => ({ ...prev, [key]: option }));
                            setOpenKey(null);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    {uniqueCategories[key].length === 0 && (
                      <div className="px-3 py-2 text-gray-400">אין הצעות</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="col-span-2 flex gap-4">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
                isEditing
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {isEditing ? "✔️ שמירת שינויים" : "➕ הוסף שיר חדש"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/4 py-2 px-4 rounded-md shadow-sm text-sm font-medium bg-gray-600 hover:bg-gray-500 text-white"
              >
                ביטול
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="h-0.5 w-full bg-teal-500/50 rounded-full mb-8 opacity-80" />

      <section className="mb-8 p-6 rounded-lg shadow-md bg-gray-900">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          ייבוא שירים מ-Excel
        </h2>
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-teal-400 hover:file:bg-gray-600"
          />
          <button
            onClick={handleImportExcel}
            disabled={excelData.length === 0}
            className={`py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              excelData.length > 0
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            ייבא {excelData.length} שירים ל-Firebase
          </button>
        </div>
      </section>

      <div className="h-0.5 w-full bg-teal-500/50 rounded-full mb-8 opacity-80" />

      <section className="mb-8 p-6 rounded-lg shadow-md bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h2 className="text-2xl font-semibold text-white">
            חיפוש וניהול שירים קיימים
          </h2>
          <button
            onClick={handleToggleSongManager}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm transition"
          >
            {showSongManager ? "סגור רשימת שירים" : "הצג רשימת שירים"}
          </button>
        </div>
        {!showSongManager ? (
          <p className="text-gray-400">
            לחץ על "הצג רשימת שירים" כדי להציג את השירים ולבצע עריכה או מחיקה.
          </p>
        ) : !songsLoaded ? (
          <p className="text-center text-gray-400 py-6">אין שירים להצגה.</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="חפש לפי שם, זמר, סולם או קצב..."
              value={songSearchTerm}
              onChange={(e) => setSongSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-50 px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-sm text-gray-400 mb-4">
              מציג {filteredSongs.length} מתוך {allSongs.length} שירים
            </p>
            {filteredSongs.length === 0 ? (
              <p className="text-center text-gray-400 py-6">
                לא נמצאו שירים תואמים לחיפוש.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredSongs.map((songItem) => (
                  <article
                    key={songItem.id}
                    className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-50" dir="rtl">
                          {songItem.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          {songItem.Singer || "—"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400 sm:text-right">
                        <p>Key: {songItem.Key || "—"}</p>
                        <p>Beat: {songItem.Beat || "—"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      <button
                        onClick={() => router.replace(`/admin?editId=${songItem.id}`)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSong(songItem.id, songItem.title)
                        }
                        disabled={deletingSongId === songItem.id}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm transition ${
                          deletingSongId === songItem.id
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-red-700 hover:bg-red-600 text-white"
                        }`}
                      >
                        {deletingSongId === songItem.id ? "מוחק..." : "מחק"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
