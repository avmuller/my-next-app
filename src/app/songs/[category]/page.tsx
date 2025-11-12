// src/app/songs/[category]/page.tsx
// Purpose: Render sub-category options for a selected top-level category.
// Example: When category is "Singer", list all unique singers found in the songs collection.
// Overview:
// - Server component in the Next.js App Router (async).
// - Reads songs from Firestore, normalizes fields, derives subcategories, and renders a grid.
import CategoryGrid from "@/components/CategoryGrid";
import Header from "@/components/Header";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Song } from "@/types/song";
import { Category, primaryCategories } from "@/data/categories";

export default async function SubCategoriesPage({
  params,
}: {
  params: { category: string };
}) {
  // Resolve route params; in the App Router `params` is synchronous.
  const resolvedParams = await (params as any);
  const category = resolvedParams.category || "unknown";

  let songs: Song[] = [];

  try {
    // 1) Fetch all songs (consider narrowing/aggregating for very large datasets)
    const songsCollection = collection(db, "songs");
    const songSnapshot = await getDocs(songsCollection);
    // 2) Map Firestore docs to Song objects and normalize array fields
    songs = songSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        Genre: Array.isArray(data.Genre) ? data.Genre : [],
        Event: Array.isArray(data.Event) ? data.Event : [],
        Season: Array.isArray(data.Season) ? data.Season : [],
      } as Song;
    });

    // 3) Early UI return when no songs exist
    if (songs.length === 0) {
      return (
        <main>
          <Header title={`Songs by category: ${category}`} />
          <p className="text-center mt-8 text-gray-500">No songs were found.</p>
        </main>
      );
    }
  } catch (error) {
    // Basic error boundary when Firestore read fails
    console.error("Error fetching songs from Firestore:", error);
    return (
      <main>
        <Header title={`An error occurred`} />
        <p className="text-center mt-8 text-red-500">
          Failed to load songs from Firebase.
        </p>
      </main>
    );
  }

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
    // Some song properties are arrays (Genre/Season/Event); others are scalars
    const isArrayField = ["Genre", "Season", "Event"].includes(fieldName);
    if (isArrayField) {
      subCategories = Array.from(
        new Set(
          songs.flatMap((s) => (s[fieldName as keyof Song] as string[]) || [])
        )
      );
    } else {
      subCategories = Array.from(
        new Set(songs.map((s) => (s[fieldName as keyof Song] as string) || ""))
      );
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
      icon: fieldName === "Singer" ? "🎤" : "🔹",
    })
  );

  return (
    <main>
      {/* Heading shows the selected top-level category */}
      <h1 className="text-2xl font-bold p-4 pb-0">{`By ${categoryTitle}`}</h1>
      <section className="p-4">
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
