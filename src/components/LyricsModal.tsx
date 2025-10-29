// src/components/LyricsModal.tsx (תיקון לטקסט מול קישור)
"use client";
import React from "react";
import { Song } from "@/types/song";

// פונקציית עזר לבדיקה אם המחרוזת היא URL
const isUrl = (str: string) => {
  try {
    // מנסה ליצור אובייקט URL כדי לבדוק את התקינות
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

interface LyricsModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export default function LyricsModal({
  song,
  isOpen,
  onClose,
}: LyricsModalProps) {
  if (!isOpen) return null;

  const lyricsContent = song.Lyrics?.trim();
  const isExternalLink = isUrl(lyricsContent || "");
  const displayContent = !isExternalLink && lyricsContent; // אם זה לא URL, זה טקסט

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-start p-4">
      {/* כותרת וכפתור סגירה */}
      <header className="flex justify-between items-center w-full mb-4 pt-4">
        <h1 className="text-xl font-bold text-teal-400">
          מילים: {song.title} - {song.Singer}
        </h1>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-teal-400 text-3xl font-light leading-none transition mr-4"
          aria-label="סגור חלון"
        >
          &times;
        </button>
      </header>

      {/* **שינוי קריטי: אזור גלילה לתוכן המילים** */}
      <div className="flex-grow w-full max-w-xl overflow-y-auto p-4 rounded-xl bg-gray-800 border border-gray-700 shadow-inner">
        {lyricsContent ? (
          <>
            {displayContent ? (
              // ** הצגת המילים כטקסט גולל **
              // whitespace-pre-wrap שומר על שבירות שורה שהוזנו בטופס
              <p
                className="text-gray-300 whitespace-pre-wrap text-right leading-relaxed text-base"
                dir="rtl"
              >
                {lyricsContent}
              </p>
            ) : (
              // הצגת כפתור קישור אם זה URL
              <div className="flex flex-col items-center justify-center p-8 h-full">
                <p className="text-gray-400 mb-6 text-base">
                  המילים נשמרו כקישור חיצוני. לחץ על הקישור לפתיחה:
                </p>
                <a
                  href={lyricsContent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-3 px-6 text-base w-full max-w-xs transition transform hover:scale-[1.02]"
                >
                  פתח קובץ מילים (PDF/קישור) 🔗
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center py-10">
            אין מילים או קישור מוגדרים עבור שיר זה.
          </p>
        )}
      </div>

      {/* כפתור סגירה תחתון */}
      <button
        onClick={onClose}
        className="btn bg-gray-700 text-gray-50 mt-6 w-full max-w-xs hover:bg-gray-600 transition"
      >
        חזור
      </button>
    </div>
  );
}
