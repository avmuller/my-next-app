// src/components/CategoryGrid.tsx
// Purpose: Render a grid of category cards that link to
// a category-specific page. Accepts optional props to
// control which categories to show and the base URL path.

import Link from "next/link";
import { primaryCategories, Category } from "@/data/categories";

interface CategoryGridProps {
  // Optional list of categories to render; falls back to primary list
  categories?: Category[];
  // Optional base path for links; defaults to "/songs"
  basePath?: string;
}

export default function CategoryGrid({
  categories,
  basePath,
}: CategoryGridProps) {
  // Use provided categories if present; otherwise fall back
  // to the primary (default) categories list.
  const listToRender = categories || primaryCategories;

  // The root path for links (defaults to "/songs").
  const baseHref = basePath || "/songs";

  // Single logo-colored frame for all cards

  return (
    // Responsive grid of category cards
    <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3 md:gap-6 md:mt-6">
      {listToRender.map((item) => {
        // Build the destination URL for the category card.
        // If a custom basePath was provided, we URL-encode the key
        // to keep links safe for special characters.
        const href = basePath
          ? `${baseHref}/${encodeURIComponent(item.key)}`
          : `${baseHref}/${item.key}`;

        // Readable label shown under the icon.
        const label = item.label;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.key}
            href={href}
            // Card-like styling with subtle hover/press feedback
            className={`card relative overflow-hidden rounded-2xl border border-teal-500/25 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 p-4 py-8 md:px-6 md:py-10 flex flex-col items-center justify-center text-center shadow-xl shadow-black/40 hover:shadow-teal-600/30 ring-1 ring-black/40 hover:ring-teal-400/60 transition transform active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 -top-10 h-24 rounded-full bg-teal-500/20 blur-3xl"
            />
            {/* Optional icon */}
            {IconComponent ? (
              <IconComponent
                aria-hidden
                className="h-10 w-10 md:h-12 md:w-12 mb-3 text-teal-200 drop-shadow"
              />
            ) : null}
            {/* Category label */}
            <span className="font-semibold text-base sm:text-lg md:text-xl text-gray-50 drop-shadow">
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
