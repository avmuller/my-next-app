// src/app/songs/[category]/page.tsx

import Link from "next/link";

import CategoryGrid from "@/components/CategoryGrid";

import Header from "@/components/Header";

// ייבוא Firebase:

import { db } from "@/lib/firebase";

import { collection, getDocs } from "firebase/firestore";

// ייבוא ה-Type המעודכן שלנו:

import { Song } from "@/types/song";

import { Category, primaryCategories } from "@/data/categories";

// הקומפוננטה הופכת להיות אסינכרונית

export default async function SubCategoriesPage({
  params,
}: {
  params: { category: string };
}) {
  // **תיקון קריטי לבעיית ה-Promise ב-Next.js:**

  // מבצעים await על params (משתמשים ב-any כדי לעקוף את שגיאת ה-TS)

  const resolvedParams = await (params as any);

  const category = resolvedParams.category || "unknown";

  // לוג לבדיקת בטיחות

  console.log("Category from URL (Fixed):", category);

  // 1. קבלת כל השירים מ-Firestore

  let songs: Song[] = [];

  try {
    const songsCollection = collection(db, "songs");

    const songSnapshot = await getDocs(songsCollection);

    songs = songSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        ...data,

        // ודא שכל שדות המערך ממופים כראוי

        Genre: Array.isArray(data.Genre) ? data.Genre : [],

        Event: Array.isArray(data.Event) ? data.Event : [],
        Season: Array.isArray(data.Season) ? data.Season : [],
      } as Song;
    });

    if (songs.length === 0) {
      return (
        <main>
          <Header title={`אין שירים בקטגוריה: ${category}`} />

          <p className="text-center mt-8 text-gray-500">
            לא נמצאו שירים בבסיס הנתונים.
          </p>
        </main>
      );
    }
  } catch (error) {
    console.error("Error fetching songs from Firestore:", error);

    return (
      <main>
        <Header title={`שגיאה בטעינת נתונים`} />

        <p className="text-center mt-8 text-red-500">
          אירעה שגיאה בטעינת הנתונים מ-Firebase.
        </p>
      </main>
    );
  }

  // 2. לוגיקת חילוץ תתי-הקטגוריות

  let subCategories: string[] = [];

  let categoryTitle = "";

  // סינון המערך לפני ה-find למניעת איברים פגומים

  const cleanCategories = primaryCategories.filter((c) => c && c.key);

  // מציאת שם השדה האמיתי והכותרת - כעת אנו מחפשים במערך נקי

  const currentCategory = cleanCategories.find(
    (c) =>
      // עכשיו אנו יודעים ש-c.key קיים, והמשתנה category בטוח שהוא מחרוזת

      c.key.toLowerCase() === category.toLowerCase()
  );

  const fieldName = currentCategory?.key;

  categoryTitle = currentCategory?.label || "קטגוריה לא ידועה";

  if (fieldName) {
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

  // 3. סינון ומיון

  const filteredSubCategoriesStrings = subCategories
    .filter((sub) => sub && sub.trim().length > 0)
    .sort((a, b) => a.localeCompare(b, "he"));

  const categoriesToRender: Category[] = filteredSubCategoriesStrings.map(
    (subLabel) => ({
      key: subLabel,

      label: subLabel,

      icon: fieldName === "Singer" ? "🎤" : "🏷️",
    })
  );

  return (
    <main>
      <h1 className="text-2xl font-bold p-4 pb-0">{`כל ה${categoryTitle}`}</h1>

      <section className="p-4">
        {categoriesToRender.length > 0 ? (
          <CategoryGrid
            categories={categoriesToRender}
            basePath={`/songs/${category}`}
          />
        ) : (
          <p className="text-center mt-8 text-gray-500">
            לא נמצאו תתי-קטגוריות עבור קטגוריה זו.
          </p>
        )}
      </section>
    </main>
  );
}
