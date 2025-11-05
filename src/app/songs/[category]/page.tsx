// src/app/songs/[category]/page.tsx (EN)
import Link from "next/link";
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
  const resolvedParams = await (params as any);
  const category = resolvedParams.category || "unknown";

  let songs: Song[] = [];

  try {
    const songsCollection = collection(db, "songs");
    const songSnapshot = await getDocs(songsCollection);
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

    if (songs.length === 0) {
      return (
        <main>
          <Header title={`Songs by category: ${category}`} />
          <p className="text-center mt-8 text-gray-500">No songs were found.</p>
        </main>
      );
    }
  } catch (error) {
    console.error("Error fetching songs from Firestore:", error);
    return (
      <main>
        <Header title={`An error occurred`} />
        <p className="text-center mt-8 text-red-500">Failed to load songs from Firebase.</p>
      </main>
    );
  }

  let subCategories: string[] = [];
  let categoryTitle = "";

  const cleanCategories = primaryCategories.filter((c) => c && c.key);
  const currentCategory = cleanCategories.find(
    (c) => c.key.toLowerCase() === category.toLowerCase()
  );

  const fieldName = currentCategory?.key;
  categoryTitle = currentCategory?.label || "Unknown category";

  if (fieldName) {
    const isArrayField = ["Genre", "Season", "Event"].includes(fieldName);
    if (isArrayField) {
      subCategories = Array.from(
        new Set(songs.flatMap((s) => (s[fieldName as keyof Song] as string[]) || []))
      );
    } else {
      subCategories = Array.from(
        new Set(songs.map((s) => (s[fieldName as keyof Song] as string) || ""))
      );
    }
  }

  const filteredSubCategoriesStrings = subCategories
    .filter((sub) => sub && sub.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "en"));

  const categoriesToRender: Category[] = filteredSubCategoriesStrings.map((subLabel) => ({
    key: subLabel,
    label: subLabel,
    icon: fieldName === "Singer" ? "🎤" : "🔹",
  }));

  return (
    <main>
      <h1 className="text-2xl font-bold p-4 pb-0">{`By ${categoryTitle}`}</h1>
      <section className="p-4">
        {categoriesToRender.length > 0 ? (
          <CategoryGrid categories={categoriesToRender} basePath={`/songs/${category}`} />
        ) : (
          <p className="text-center mt-8 text-gray-500">No sub-categories available for this selection.</p>
        )}
      </section>
    </main>
  );
}

