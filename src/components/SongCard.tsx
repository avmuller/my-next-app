// src/components/SongCard.tsx (EN)
"use client";
import React, { useState } from "react";
import { Song } from "@/types/song";
import LyricsModal from "./LyricsModal";
import AddToPlaylistMenu from "@/components/Playlists/AddToPlaylistMenu";

interface SongCardProps {
  song: Song;
}

export default function SongCard({ song }: SongCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="card relative overflow-visible rounded-2xl border border-teal-500/20 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-5 md:p-7 flex flex-col gap-3 md:gap-4 cursor-pointer shadow-lg shadow-black/40 hover:shadow-teal-600/30 ring-1 ring-black/40 hover:ring-teal-400/60 transition"
        onClick={() => setIsModalOpen(true)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 -top-12 h-24 rounded-full bg-teal-500/20 blur-3xl"
        />
        <div className="flex items-start justify-between gap-3 md:gap-4">
          {/* Left: Playlist button + key/beat pills */}
          <div className="flex items-start gap-2">
            <AddToPlaylistMenu songId={song.id} songTitle={song.title} />
            <div className="flex flex-col items-start gap-2 md:gap-3">
              {song.Key ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/40 text-teal-100 px-2.5 py-0.5 text-xs md:text-sm md:px-3 md:py-1">
                  <span className="font-medium text-teal-200">Key</span>
                  <span className="text-teal-400/70" aria-hidden>
                    |
                  </span>
                  <span className="font-semibold text-teal-300">
                    {song.Key}
                  </span>
                </span>
              ) : null}
              {song.Beat ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-100 px-2.5 py-0.5 text-xs md:text-sm md:px-3 md:py-1">
                  <span className="font-medium text-cyan-200">Beat</span>
                  <span className="text-cyan-400/70" aria-hidden>
                    |
                  </span>
                  <span className="font-semibold text-cyan-300">
                    {song.Beat}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
          {/* Right: Title (RTL) + Singer under */}
          <div className="text-right">
            <div className="font-semibold text-lg md:text-xl text-gray-50" dir="rtl">
              {song.title}
            </div>
            {song.Singer ? (
              <div className="text-sm md:text-base text-amber-200 font-semibold" dir="rtl">
                {song.Singer}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <LyricsModal
        song={song}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
