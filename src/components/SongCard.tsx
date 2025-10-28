"use client";
import React from "react";

type Song = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genres: string[];
  styles: string[];
  events: string[];
};

export default function SongCard({ song }: { song: Song }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{song.title}</div>
          <div className="text-sm text-gray-600">{song.artist}</div>
        </div>
        <div className="badge bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          BPM: {song.bpm}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {song.genres.map((g) => (
          <span key={g} className="badge bg-gray-100 px-3 py-1 rounded-full">
            {g}
          </span>
        ))}
        {song.styles.map((s) => (
          <span key={s} className="badge bg-gray-100 px-3 py-1 rounded-full">
            {s}
          </span>
        ))}
      </div>

      <button className="btn btn-primary mt-2 w-full">
        + הוסף לרשימה אישית
      </button>
    </div>
  );
}
