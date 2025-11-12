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
        className="w-full px-4 py-3 rounded-xl bg-gray-800/90 text-gray-200 text-lg shadow-lg flex items-center transition ring-2 ring-sky-400/60 hover:ring-sky-300 ring-offset-2 ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        aria-label="Search Songs"
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {text}
      </div>
    </Link>
  );
}
