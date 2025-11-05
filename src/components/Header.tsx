// src/components/Header.tsx (EN)
"use client";
import Link from "next/link";
import React from "react";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-14 flex-shrink-0 bg-gray-900/90 backdrop-blur border-b border-gray-700">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/" className="text-base font-bold text-gray-50">
          {title || "Song Selection"}
        </Link>
        <Link
          href="/admin"
          className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-600 transition"
          aria-label="Admin"
        >
          Admin Panel
        </Link>
      </div>
    </header>
  );
}

