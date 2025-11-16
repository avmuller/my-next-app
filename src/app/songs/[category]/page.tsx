// src/app/songs/[category]/page.tsx
// Purpose: Render sub-category options for a selected top-level category.
// Example: When category is "Singer", list all unique singers found in the songs collection.
// Overview:
// - Server component in the Next.js App Router (async).
// - Reads songs from Firestore, normalizes fields, derives subcategories, and renders a grid.
import CategoryGrid from "@/components/CategoryGrid";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Category, primaryCategories } from "@/data/categories";

interface CategoryMetadataDoc {
  values?: string[];
}

export default async function SubCategoriesPage({
  params,
}: {
  params: { category: string };
}) {
  // Resolve route params; in the App Router `params` is synchronous.
  const resolvedParams = await (params as any);
  const category = resolvedParams.category || "unknown";

  let subCategories: string[] = [];
  let categoryTitle = "";

  // Identify the current top-level category from the URL param
  const cleanCategories = primaryCategories.filter((c) => c && c.key);
  const currentCategory = cleanCategories.find(
    (c) => c.key.toLowerCase() === category.toLowerCase()
  );

  const fieldName = currentCategory?.key;
  categoryTitle = currentCategory?.label || "Unknown category";

  if (fieldName) {
    try {
      const metadataDoc = doc(db, "categories_metadata", fieldName);
      const snapshot = await getDoc(metadataDoc);
      if (snapshot.exists()) {
        const metadata = snapshot.data() as CategoryMetadataDoc;
        if (Array.isArray(metadata.values)) {
          subCategories = metadata.values;
        }
      }
    } catch (error) {
      console.error("Failed to load category metadata", error);
    }
  }

  // Remove empty values and sort for a consistent UI
  const filteredSubCategoriesStrings = subCategories
    .filter((sub) => sub && sub.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "en"));

  const categoriesToRender: Category[] = filteredSubCategoriesStrings.map(
    (subLabel) => ({
      key: subLabel,
      label: subLabel,
      icon: currentCategory?.icon ?? undefined,
    })
  );

  return (
    <main>
      {/* Heading shows the selected top-level category */}
      <h1 className="text-2xl font-bold p-4 pb-0">{`By ${categoryTitle}`}</h1>
      <section className="p-2 sm:p-3">
        {/* Render a grid of subcategories or a friendly fallback */}
        {categoriesToRender.length > 0 ? (
          <CategoryGrid
            categories={categoriesToRender}
            basePath={`/songs/${category}`}
          />
        ) : (
          <p className="text-center mt-8 text-gray-500">
            No sub-categories available for this selection.
          </p>
        )}
      </section>
    </main>
  );
}
