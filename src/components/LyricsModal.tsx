// src/components/LyricsModal.tsx (EN)
"use client";
import React from "react";
import { Song } from "@/types/song";

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

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-start p-4">
      <header className="flex justify-between items-center w-full mb-4 pt-4">
        <h1 className="text-xl font-bold text-teal-400">
          Lyrics: {song.title} - {song.Singer}
        </h1>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-teal-400 text-3xl font-light leading-none transition mr-4"
          aria-label="Close modal"
        >
          &times;
        </button>
      </header>

      <div className="flex-grow w-full max-w-xl overflow-y-auto p-4 rounded-xl bg-gray-800 border border-gray-700 shadow-inner">
        {lyricsContent ? (
          <>
            {displayContent ? (
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base">{lyricsContent}</p>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 h-full">
                <p className="text-gray-400 mb-6 text-base">
                  The lyrics are available as an external link:
                </p>
                <a
                  href={lyricsContent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary py-3 px-6 text-base w-full max-w-xs transition transform hover:scale-[1.02]"
                >
                  Open Lyrics (PDF/External)
                </a>
              </div>
            )}
          </>
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

