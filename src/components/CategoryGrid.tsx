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
    // Two-column grid of category cards (original layout)
    <div className="grid grid-cols-2 gap-4 mt-4">
      {listToRender.map((item) => {
        // Build the destination URL for the category card.
        // If a custom basePath was provided, we URL-encode the key
        // to keep links safe for special characters.
        const href = basePath
          ? `${baseHref}/${encodeURIComponent(item.key)}`
          : `${baseHref}/${item.key}`;

        // Readable label shown under the icon.
        const label = item.label;
        const icon = (item as Category).icon;

        return (
          <Link
            key={item.key}
            href={href}
            // Card-like styling with subtle hover/press feedback
            className={`card rounded-2xl shadow-xl p-4 py-8 flex flex-col items-center justify-center text-center hover:bg-gray-700 transition transform active:scale-[.98] ring-1 ring-sky-400/50 hover:ring-sky-300 brand-inner-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300`}
          >
            {/* Optional icon */}
            {icon && (
              <span className="text-4xl mb-3" aria-hidden>
                {icon}
              </span>
            )}
            {/* Category label */}
            <span className="font-semibold text-base sm:text-lg text-gray-50">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
