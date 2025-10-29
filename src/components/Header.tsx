// src/components/Header.tsx
"use client";
import Link from "next/link";
import React from "react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    // **שינוי:** רקע כהה (bg-gray-900/90), גבול כהה (border-gray-700)
    <header className="sticky top-0 z-20 h-14 flex-shrink-0 bg-gray-900/90 backdrop-blur border-b border-gray-700">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/" className="text-base font-bold text-gray-50">
          {" "}
          {/* **שינוי:** טקסט בהיר */}
          {title || "בחירת שירים"}
        </Link>
        {/* **שינוי:** כפתור אדמין בהיר יותר (bg-gray-700) וטקסט לבן */}
        <Link
          href="/admin"
          className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-600 transition"
          aria-label="אדמין"
        >
          ⚙️ אדמין
        </Link>
      </div>
    </header>
  );
}
