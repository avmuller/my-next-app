// src/components/SearchBoxLink.tsx (UPDATED to accept className)
"use client";

import Link from "next/link";
import clsx from "clsx"; // חובה לייבא clsx

export default function SearchBoxLink({ className }: { className?: string }) {
  return (
    <Link
      href="/search"
      // **שינוי:** הוספת className חיצוני
      className={clsx("block", className)}
    >
      <div
        className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 text-lg shadow-lg flex items-center hover:border-teal-500 transition"
        aria-label="התחל חיפוש"
      >
        🔎 חפש שיר, אמן, סולם...
      </div>
    </Link>
  );
}
