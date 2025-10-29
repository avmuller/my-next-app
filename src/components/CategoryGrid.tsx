// src/components/CategoryGrid.tsx
import Link from "next/link";
// **חובה לייבא** את הטיפוסים והרשימה הקבועה
import { primaryCategories, Category } from "@/data/categories";

// **חובה להגדיר** את ה-Props
interface CategoryGridProps {
  categories?: Category[];
  basePath?: string;
}

export default function CategoryGrid({
  categories,
  basePath,
}: CategoryGridProps) {
  // **חובה להגדיר** את רשימת האיברים להצגה
  const listToRender = categories || primaryCategories;
  // **חובה להגדיר** את נתיב הבסיס
  const baseHref = basePath || "/songs";

  return (
    // עיצוב רשת מודרני
    <div className="grid grid-cols-2 gap-4 mt-4">
      {listToRender.map((item) => {
        // **שחזור לוגיקת יצירת הקישור**
        const href = basePath
          ? `${baseHref}/${encodeURIComponent(item.key)}` // תתי-קטגוריות
          : `${baseHref}/${item.key}`; // קטגוריות ראשיות (בדף הבית)

        const label = item.label;
        const icon = (item as Category).icon;

        return (
          <Link
            key={item.key}
            href={href}
            // שינוי עיצוב ל-Dark Mode
            className="card rounded-2xl shadow-xl p-4 py-8 flex flex-col items-center justify-center text-center hover:bg-gray-700 transition transform active:scale-[.98]"
          >
            {icon && (
              <span className="text-4xl mb-3" aria-hidden>
                {icon}
              </span>
            )}
            {/* טקסט בהיר במצב כהה */}
            <span className="font-semibold text-sm text-gray-50">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
