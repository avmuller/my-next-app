/* eslint-disable react-hooks/set-state-in-effect */
// src/components/Admin/SongForm.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Song, SongForm } from "@/types/song";
import {
  initialSongState,
  SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE,
  MULTI_VALUE_FIELDS,
} from "@/lib/admin-config";
import { saveSongAction } from "@/app/admin/actions";
import { ToastType } from "./AdminToast";

interface FormReadySong extends SongForm {
  id: string;
}

type MultiValueField = (typeof MULTI_VALUE_FIELDS)[number];
type SongFormUI = Omit<SongForm, MultiValueField> &
  Record<MultiValueField, string>;

type SongLike = Song | FormReadySong;

const createEmptyForm = (): SongFormUI => {
  const { Genre: _g, Event: _e, Season: _s, ...rest } = initialSongState;
  return {
    ...rest,
    id: "",
    Genre: "",
    Event: "",
    Season: "",
  };
};

const FORM_FIELDS = Object.keys(createEmptyForm()) as Array<keyof SongFormUI>;

const normalizeToUIState = (songData: SongLike | null): SongFormUI => {
  const empty = createEmptyForm();
  if (!songData) return empty;

  const filled = { ...empty };
  (Object.keys(empty) as Array<keyof SongFormUI>).forEach((key) => {
    const incoming = songData[key as keyof Song];
    if (incoming == null) return;

    if (MULTI_VALUE_FIELDS.includes(key as keyof Song)) {
      filled[key as MultiValueField] = Array.isArray(incoming)
        ? incoming.join(", ")
        : String(incoming);
    } else {
      filled[key] = String(incoming);
    }
  });

  return filled;
};

interface SongFormProps {
  initialSongData: FormReadySong | null;
  allSongs: Song[];
  uniqueCategories: Record<string, string[]>;
  showToast: (msg: string, type: ToastType) => void;
  onSuccess: () => void;
}

export default function SongForm({
  initialSongData,
  allSongs,
  uniqueCategories,
  showToast,
  onSuccess,
}: SongFormProps) {
  const [song, setSong] = useState<SongFormUI>(() => createEmptyForm());
  const [openKey, setOpenKey] = useState<keyof SongFormUI | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdFromURL = searchParams.get("editId");
  const isEditing = Boolean(editIdFromURL);

  const lastPrefilledId = useRef<string | null>(null);

  const resetFormState = useCallback(() => {
    setSong(createEmptyForm());
    setQueries({});
    lastPrefilledId.current = null;
  }, []);

  const hydrateForm = useCallback(
    (source: SongLike) => {
      setSong(normalizeToUIState(source));
      setQueries({});
      if (source.id !== lastPrefilledId.current) {
        showToast(`עורך את ${source.title}`, "info");
        lastPrefilledId.current = source.id;
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (initialSongData) {
      hydrateForm(initialSongData);
      return;
    }

    if (editIdFromURL) {
      const fallbackSong = allSongs.find((item) => item.id === editIdFromURL);
      if (fallbackSong) {
        hydrateForm(fallbackSong);
        return;
      }
    }

    resetFormState();
  }, [initialSongData, editIdFromURL, allSongs, hydrateForm, resetFormState]);

  const updateField = useCallback((field: keyof SongFormUI, value: string) => {
    setSong((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCancelEdit = () => {
    resetFormState();
    showToast("העריכה בוטלה.", "info");
    router.replace("/admin");
  };

  const uiToSongForm = (ui: SongFormUI): SongForm => {
    const out = {} as any;
    (Object.keys(ui) as Array<keyof SongFormUI>).forEach((key) => {
      if (MULTI_VALUE_FIELDS.includes(key as keyof Song)) {
        const raw = ui[key] as string;
        out[key] = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        out[key] = ui[key];
      }
    });
    return out as SongForm;
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = uiToSongForm(song);
      const result = await saveSongAction(payload, editIdFromURL);
      showToast(result.message, "success");
      resetFormState();
      router.replace("/admin");
      onSuccess();
    } catch (error) {
      console.error("Error saving song:", error);
      showToast("שמירת השיר נכשלה. בדוק את הלוג.", "error");
    }
  };

  const formFields = FORM_FIELDS;

  return (
    <section className="mb-8 p-6 rounded-lg shadow-2xl bg-gray-900">
      <h2 className="text-2xl font-semibold mb-4 text-white">
        {isEditing ? `עריכת שיר: ${song.title}` : "הוספת שיר חדש"}
      </h2>

      <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
        {formFields.map((key) => {
          const isMultiValue = MULTI_VALUE_FIELDS.includes(key as keyof Song);
          const isAutocomplete = SINGLE_VALUE_FIELDS_FOR_AUTOCOMPLETE.includes(
            key as keyof Song
          );
          const isRequired = key === "title";
          const value = song[key] || "";

          return (
            <div key={key as string} className="relative">
              <label
                htmlFor={key as string}
                className="block text-sm font-medium text-white"
              >
                {key === "title"
                  ? "שם השיר"
                  : key.charAt(0).toUpperCase() + key.slice(1)}
                {isMultiValue && " (מופרד בפסיקים)"}
              </label>
              <input
                type="text"
                name={key as string}
                id={key as string}
                value={value}
                onFocus={() => isAutocomplete && setOpenKey(key)}
                onBlur={() =>
                  setTimeout(
                    () =>
                      setOpenKey((current) =>
                        current === key ? null : current
                      ),
                    100
                  )
                }
                onChange={(e) => {
                  const field = e.target.name as keyof SongFormUI;
                  updateField(field, e.target.value ?? "");
                  if (isAutocomplete) {
                    setQueries((prev) => ({
                      ...prev,
                      [field]: e.target.value ?? "",
                    }));
                    setOpenKey(field);
                  }
                }}
                required={isRequired}
                autoComplete="off"
                className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm p-2 bg-gray-800 text-gray-50 placeholder-gray-500"
              />

              {isAutocomplete &&
                openKey === key &&
                Array.isArray(uniqueCategories[key as string]) && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-700 bg-gray-800 text-gray-50 shadow-lg">
                    {(uniqueCategories[key as string] || [])
                      .filter((opt) =>
                        (queries[key as string] ?? "")
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
                            updateField(key, option);
                            setQueries((prev) => ({
                              ...prev,
                              [key as string]: option,
                            }));
                            setOpenKey(null);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    {(uniqueCategories[key as string] || []).length === 0 && (
                      <div className="px-3 py-2 text-gray-400">
                        אין הצעות זמינות
                      </div>
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
            {isEditing ? "שמירה" : "הוספה"}
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
