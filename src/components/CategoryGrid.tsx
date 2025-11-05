// src/components/CategoryGrid.tsx

import Link from "next/link";
import { primaryCategories, Category } from "@/data/categories";

interface CategoryGridProps {
  categories?: Category[];
  basePath?: string;
}

export default function CategoryGrid({
  categories,
  basePath,
}: CategoryGridProps) {
  const listToRender = categories || primaryCategories;
  const baseHref = basePath || "/songs";

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {listToRender.map((item) => {
        const href = basePath
          ? `${baseHref}/${encodeURIComponent(item.key)}` // תתי-קטגוריות
          : `${baseHref}/${item.key}`; // קטגוריות ראשיות (בדף הבית)
        const label = item.label;
        const icon = (item as Category).icon;

        return (
          <Link
            key={item.key}
            href={href}
            className="card rounded-2xl shadow-xl p-4 py-8 flex flex-col items-center justify-center text-center hover:bg-gray-700 transition transform active:scale-[.98]"
          >
            {icon && (
              <span className="text-4xl mb-3" aria-hidden>
                {icon}
              </span>
            )}

            <span className="font-semibold text-sm text-gray-50">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
