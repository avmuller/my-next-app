// src/app/page.tsx (EN)
// Purpose: Home page showing a search shortcut and
// the primary categories grid.
import CategoryGrid from "@/components/CategoryGrid";
import SearchBoxLink from "@/components/SearchBoxLink";
import { primaryCategories } from "@/data/categories";

export default function HomePage() {
  return (
    // Page container
    <div className="p-4">
      {/* Link to the dedicated search page */}
      <SearchBoxLink className="mb-6" defaultText="Browse all songs" focusText="Search by title, key, beat..." />
      <p className="text-gray-400 mb-4">Choose a category:</p>
      {/* Render the default categories */}
      <CategoryGrid categories={primaryCategories} />
    </div>
  );
}
