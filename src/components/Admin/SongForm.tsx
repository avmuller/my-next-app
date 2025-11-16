// src/components/Admin/SongForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Song, SongForm } from "@/types/song";
import {
  initialSongState,
  SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE,
  MULTI_VALUE_FIELDS,
} from "@/lib/admin-config";
import { saveSongAction } from "@/app/admin/actions";
import { ToastType } from "./AdminToast";

// Temporary interface until we separate SongFormType properly in config
interface FormReadySong extends SongForm {
  id: string;
}

interface SongFormProps {
  initialSongData: FormReadySong | null;
  uniqueCategories: Record<string, string[]>;
  showToast: (msg: string, type: ToastType) => void;
  onSuccess: () => void; // Function to trigger data reload on parent
}

export default function SongForm({
  initialSongData,
  uniqueCategories,
  showToast,
  onSuccess,
}: SongFormProps) {
  const [song, setSong] = useState<SongForm>(initialSongState);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdFromURL = searchParams.get("editId");
  const isEditing = !!editIdFromURL;

  // Sync state with server-fetched edit data
  useEffect(() => {
    if (initialSongData && initialSongData.id === editIdFromURL) {
      setSong(initialSongData);
      showToast(`Editing song: ${initialSongData.title}`, "info");
    } else if (!editIdFromURL) {
      setSong(initialSongState);
    }
    // Note: initialSongData is server-fetched, so dependencies are okay here.
  }, [initialSongData, editIdFromURL]);

  const handleCancelEdit = () => {
    setSong(initialSongState);
    showToast("Edit canceled.", "info");
    router.replace("/admin");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call Server Action
      const result = await saveSongAction(song, editIdFromURL);
      showToast(result.message, "success");
      setSong(initialSongState);
      router.replace("/admin");
      onSuccess(); // Triggers reload of songs/categories on parent
    } catch (error) {
      console.error("Error saving song:", error);
      showToast("❌ Error saving song. Check the console.", "error");
    }
  };

  const handleManualChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name]: value }));
  };

  const formFields = Object.keys(initialSongState) as Array<keyof SongForm>;

  return (
    <section className="mb-8 p-6 rounded-lg shadow-2xl bg-gray-900">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        {isEditing ? `עריכת שיר: ${song.title}` : "הוספת שיר יחיד"}
      </h2>

      <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
        {formFields.map((key) => {
          const isMultiValue = MULTI_VALUE_FIELDS.includes(key as keyof Song);
          const isAutocomplete = SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE.includes(
            key as keyof Song
          );
          const isRequired = key === "title" || key === "Singer";
          // Value handling for arrays (converted to string on server in fetchSongForEditAction)
          const value = (song[key] as string) || "";

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

              {/* Autocomplete / DATALIST */}
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
                            (prev) => ({ ...prev, [key]: option } as any)
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
  );
}
