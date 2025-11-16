// src/components/SearchBoxLink.tsx (EN)
"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";

interface Props {
  className?: string;
  defaultText?: string;
  focusText?: string;
}

export default function SearchBoxLink({ className, defaultText, focusText }: Props) {
  const [focused, setFocused] = useState(false);
  const idleText = defaultText ?? "Search by title, key, beat...";
  const activeText = focusText ?? "Search by title, key, beat...";
  const text = focused ? activeText : idleText;

  return (
    <Link href="/search" className={clsx("block", className)}>
      <div
        className="w-full relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 px-4 md:px-6 py-3 md:py-4 text-gray-100 text-lg md:text-xl shadow-xl shadow-black/40 hover:shadow-teal-600/30 ring-1 ring-black/40 hover:ring-teal-400/60 flex items-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
        aria-label="Search Songs"
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 -top-12 h-24 rounded-full bg-teal-500/20 blur-3xl"
        />
        <span className="relative font-medium drop-shadow">{text}</span>
      </div>
    </Link>
  );
}
