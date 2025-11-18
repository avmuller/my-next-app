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
  onDelete: () => void;
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
  const [confirmDialog, setConfirmDialog] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    setAllSongs(initialAllSongs);
  }, [initialAllSongs]);

  const sortedSongs = useMemo(() => {
    return [...allSongs].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", "he", {
        sensitivity: "base",
        numeric: true,
      })
    );
  }, [allSongs]);

  const filteredSongs = useMemo(() => {
    const term = songSearchTerm.toLowerCase().trim();
    if (!term) return sortedSongs;
    return sortedSongs.filter((item) => {
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
  }, [sortedSongs, songSearchTerm]);

  const handleDeleteSong = async (songId: string) => {
    setDeletingSongId(songId);
    try {
      await deleteSongAction(songId);
      setAllSongs((prev) => prev.filter((song) => song.id !== songId));
      onDelete();
      showToast("השיר נמחק.", "success");
    } catch (error) {
      console.error("Error deleting song:", error);
      showToast("מחיקת השיר נכשלה.", "error");
    } finally {
      setDeletingSongId(null);
      setConfirmDialog(null);
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
    router.replace(`/admin?editId=${songId}`);
  };

  return (
    <section className="mb-8 p-6 rounded-lg border border-gray-800 bg-gradient-to-br from-gray-950 to-slate-900 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <h2 className="text-2xl font-semibold text-white">
          ניהול רשימת השירים
        </h2>
        <button
          onClick={handleToggleSongManager}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-50 text-sm transition"
        >
          {showSongManager
            ? "הסתר רשימה"
            : `הצג רשימה (${sortedSongs.length})`}
        </button>
      </div>
      {!showSongManager ? (
        <p className="text-gray-400" dir="rtl">
          לחץ על &quot;הצג רשימה&quot; כדי לראות ולנהל את כל השירים.
        </p>
      ) : (
        <>
          <input
            type="text"
            placeholder="חפש לפי שם שיר, זמר, מלחין או מילת מפתח..."
            value={songSearchTerm}
            onChange={(e) => setSongSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 text-gray-50 px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            dir="rtl"
          />
          <p className="text-sm text-gray-400 mb-4" dir="rtl">
            מציג {filteredSongs.length} מתוך {sortedSongs.length} שירים
          </p>
          {filteredSongs.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              לא נמצאו שירים מתאימים.
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
                      <p className="text-lg font-semibold text-gray-50" dir="rtl">
                        {song.title}
                      </p>
                      <p className="text-sm font-medium text-amber-300" dir="rtl">
                        {song.Singer || "לא צוין"}
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
                      עריכה
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          id: song.id,
                          title: song.title || "ללא שם",
                        })
                      }
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

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-700 p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-semibold text-gray-50 mb-3" dir="rtl">
              למחוק את השיר{" "}
              <span className="text-emerald-300">{confirmDialog.title}</span>?
            </h3>
            <p className="text-gray-300 mb-6" dir="rtl">
              המחיקה סופית ולא ניתן לשחזר את השיר לאחר מכן.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDeleteSong(confirmDialog.id)}
                disabled={deletingSongId === confirmDialog.id}
                className="flex-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 text-white font-semibold py-2 shadow-lg shadow-red-900/40 hover:brightness-110 disabled:opacity-60"
              >
                {deletingSongId === confirmDialog.id ? "מוחק..." : "מחק"}
              </button>
              <button
                onClick={() => setConfirmDialog(null)}
                disabled={deletingSongId === confirmDialog.id}
                className="flex-1 rounded-lg border border-gray-600 text-gray-200 font-semibold py-2 hover:bg-gray-800 disabled:opacity-60"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
