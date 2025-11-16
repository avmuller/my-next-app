// src/components/Admin/SongManager.tsx
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Song } from "@/types/song";
import { deleteSongAction } from "@/app/admin/actions";
import { ToastType } from "./AdminToast";

interface SongManagerProps {
  initialAllSongs: Song[];
  showToast: (msg: string, type: ToastType) => void;
  onDelete: () => void; // Function to trigger data reload on parent
}

export default function SongManager({
  initialAllSongs,
  showToast,
  onDelete,
}: SongManagerProps) {
  const router = useRouter();
  const [allSongs, setAllSongs] = useState<Song[]>(initialAllSongs);
  const [songSearchTerm, setSongSearchTerm] = useState("");
  const [showSongManager, setShowSongManager] = useState(false);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);

  // Sync internal state when props change (after server reload/action)
  useEffect(() => {
    setAllSongs(initialAllSongs);
  }, [initialAllSongs]);

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

  const handleDeleteSong = async (songId: string, title: string) => {
    // Replaced window.confirm with a simpler mechanism since we're not implementing a full modal here.
    const confirmed = window.confirm(
      `Delete "${title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingSongId(songId);
    try {
      await deleteSongAction(songId); // Call Server Action
      setAllSongs((prev) => prev.filter((song) => song.id !== songId));
      onDelete(); // Notify parent to refresh categories
      showToast("Song deleted.", "success");
    } catch (error) {
      console.error("Error deleting song:", error);
      showToast("Failed to delete song.", "error");
    } finally {
      setDeletingSongId(null);
    }
  };

  const handleToggleSongManager = () => {
    const next = !showSongManager;
    setShowSongManager(next);
    if (!next) {
      setSongSearchTerm("");
    }
  };

  const handleEdit = (songId: string) => {
    // Uses router.replace to update the URL parameter which triggers server re-render
    router.replace(`/admin?editId=${songId}`);
  };

  return (
    <section className="mb-8 p-6 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-950 to-slate-900 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <h2 className="text-2xl font-semibold text-white">
          חיפוש וניהול שירים קיימים
        </h2>
        <button
          onClick={handleToggleSongManager}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm transition"
        >
          {showSongManager
            ? "סגור רשימת שירים"
            : `הצג רשימת שירים (${allSongs.length})`}
        </button>
      </div>
      {!showSongManager ? (
        <p className="text-gray-400">
          לחץ על "הצג רשימת שירים" כדי לראות ולנהל את כל {allSongs.length}{" "}
          השירים.
        </p>
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
              {filteredSongs.map((song) => (
                <article
                  key={song.id}
                  className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 p-4 shadow-lg shadow-teal-900/15 space-y-4"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-teal-400 to-emerald-500"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="text-right">
                      <p
                        className="text-lg font-semibold text-gray-50"
                        dir="rtl"
                      >
                        {song.title}
                      </p>
                      <p className="text-sm font-medium text-amber-300">
                        {song.Singer || "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-start gap-2 text-xs font-semibold text-teal-200 sm:justify-end">
                      <span className="inline-flex items-center rounded-full bg-teal-500/10 px-3 py-1">
                        Key: {song.Key || "—"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1">
                        Beat: {song.Beat || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(song.id)}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-sky-900/40 transition hover:brightness-110"
                    >
                      ערוך
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song.id, song.title)}
                      disabled={deletingSongId === song.id}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm transition ${
                        deletingSongId === song.id
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg shadow-red-900/40 hover:brightness-110"
                      }`}
                    >
                      {deletingSongId === song.id ? "מוחק..." : "מחק"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
