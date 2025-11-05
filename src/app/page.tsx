// src/app/page.tsx (EN)
import CategoryGrid from "@/components/CategoryGrid";
import SearchBoxLink from "@/components/SearchBoxLink";
import { primaryCategories } from "@/data/categories";

export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-50 mt-2 mb-6">Browse Songs</h1>
      <SearchBoxLink className="mb-6" />
      <p className="text-gray-400 mb-4">Choose a category:</p>
      <CategoryGrid categories={primaryCategories} />
    </div>
  );
}

