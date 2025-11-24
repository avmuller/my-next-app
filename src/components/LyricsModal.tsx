// src/components/LyricsModal.tsx (EN)
// Purpose: Modal to display lyrics either as inline text or a link
// to an external resource (e.g., PDF). Controlled by parent.
"use client";
import React from "react";
import { Song } from "@/types/song";
import { beatDisplayText } from "@/lib/beatUtils";

// Small helper: detect whether a string is a valid absolute URL
const isUrl = (str: string) => {
  try {
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

export default function LyricsModal({ song, isOpen, onClose }: LyricsModalProps) {
  if (!isOpen) return null;

  const lyricsContent = song.Lyrics?.trim();
  const isExternalLink = isUrl(lyricsContent || "");
  const displayContent = !isExternalLink && lyricsContent;
  const beatText = beatDisplayText(song.Beat);
  const metaItems = [
    { label: "Singer", value: song.Singer },
    { label: "Composer", value: song.Composer },
  ].filter(({ value }) => value && value.trim().length > 0);
  const chips = [
    { label: "Beat", value: beatText },
    { label: "Key", value: song.Key },
    { label: "Genre", value: song.Genre?.[0] },
  ].filter(({ value }) => value && value.toString().trim().length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-start p-4">
      <header className="w-full max-w-2xl mb-4 pt-4" dir="rtl">
        <div className="flex flex-row-reverse items-start justify-between gap-3 rounded-xl border border-gray-700/70 bg-gradient-to-l from-gray-900/70 via-gray-900/40 to-teal-900/30 p-4 shadow-lg">
          <div className="flex-1 text-right leading-tight">
            <p className="text-xs text-teal-300 uppercase tracking-[0.14em]">Lyrics</p>
            <h1 className="text-2xl font-semibold text-gray-50 mt-1">{song.title}</h1>
            {metaItems.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 justify-end text-[12px] text-gray-400">
                {metaItems.map(({ label, value }) => (
                  <span key={label} className="inline-flex items-center gap-1">
                    <span className="text-gray-200 font-medium">{value}</span>
                    <span className="text-gray-500">: {label}</span>
                  </span>
                ))}
              </div>
            )}
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                {chips.map(({ label, value }) => (
                  <span
                    key={`${label}-${value}`}
                    className="inline-flex items-center gap-2 rounded-full border border-teal-400/50 bg-teal-500/10 px-3 py-1 text-[12px] text-teal-100 shadow-sm"
                  >
                    <span className="text-gray-50 font-semibold">{value}</span>
                    <span className="text-teal-200/80">{label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-teal-400 text-3xl font-light leading-none transition mr-2"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
      </header>

      {/* Scrollable content area: song details + text or link */}
      <div className="flex-grow w-full max-w-2xl overflow-y-auto p-4 rounded-xl bg-gray-800 border border-gray-700 shadow-inner">
        {lyricsContent ? (
          <div className="flex flex-col gap-4" dir="rtl">
            {displayContent ? (
              <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-lg md:text-xl text-right">
                {lyricsContent}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 h-full text-right">
                <p className="text-gray-300 mb-6 text-base">Lyrics are available via an external link:</p>
                <a
                  href={lyricsContent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-3 px-6 text-base w-full max-w-xs transition transform hover:scale-[1.02]"
                  dir="ltr"
                >
                  Open Lyrics (PDF/External)
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10">No lyrics provided for this song.</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="btn bg-gray-700 text-gray-50 mt-6 w-full max-w-xs hover:bg-gray-600 transition"
      >
        Close
      </button>
    </div>
  );
}
