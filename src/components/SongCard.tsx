// src/components/SongCard.tsx
"use client";
import React, { useState } from "react";
import { Song } from "@/types/song";
import LyricsModal from "./LyricsModal"; // ייבוא המודל החדש

export default function SongCard({ song }: { song: Song }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* 1. הכרטיס כולו הופך להיות כפתור המפעיל את המודל */}
      <div
        className="card p-4 flex flex-col gap-2 hover:bg-gray-700 transition cursor-pointer"
        onClick={() => setIsModalOpen(true)} // **הוספת onClick**
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-50">{song.title}</div>
            <div className="text-sm text-gray-400">{song.Singer}</div>
          </div>
          <div className="text-sm text-gray-400">סולם: {song.Key}</div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {song.Beat && (
            <span
              key="beat"
              className="badge bg-teal-800 text-teal-400 px-3 py-1 rounded-full"
            >
              מקצב: {song.Beat}
            </span>
          )}
          {/* מציגים ז'אנרים ואירועים כתגיות */}
          {song.Genre &&
            song.Genre.map((g) => (
              <span
                key={g}
                className="badge bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
              >
                {g}
              </span>
            ))}
          {song.Event &&
            song.Event.map((e) => (
              <span
                key={e}
                className="badge bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
              >
                {e}
              </span>
            ))}
        </div>

        {/* 2. **הסרת כפתור "הוסף לרשימה אישית" מכרטיס השיר**
           מכיוון שהכרטיס עצמו הוא כעת הכפתור הראשי לפתיחת המילים */}
        {/* <button className="btn btn-primary mt-2 w-full"> 
          + הוסף לרשימה אישית
        </button> */}
      </div>

      {/* 3. **הצגת המודל** */}
      <LyricsModal
        song={song}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
