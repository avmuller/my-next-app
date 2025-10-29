// src/app/page.tsx (FINAL UPDATED FIX)
import CategoryGrid from "@/components/CategoryGrid";
import SearchBoxLink from "@/components/SearchBoxLink";
import { primaryCategories } from "@/data/categories";

export default function HomePage() {
  return (
    // **שינוי:** הסרת space-y-4. נשתמש רק ב-p-4.
    <div className="p-4">
      {/* H1: מרווח תחתון mb-6 (גדול) להפרדה מהחיפוש */}
      <h1 className="text-2xl font-bold text-gray-50 mt-2 mb-6">ברוך הבא 🎶</h1>

      {/* SearchBoxLink: הוספת מרווח תחתון mb-6 (24px) */}
      <SearchBoxLink className="mb-6" />

      {/* Paragraph: מרווח תחתון mb-4 (רגיל) להפרדה מהרשת */}
      <p className="text-gray-400 mb-4">או בחר שירים לפי קטגוריות:</p>

      <CategoryGrid categories={primaryCategories} />
    </div>
  );
}
